import { Router } from 'express';
import { UserModel } from 'src/models/user-model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import { VerificationModel } from 'src/models/verification-model';
import { sendEmail } from 'src/middleware/verification-email';
import { authenticate } from 'src/middleware/authenticate';

const userRouter = Router();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret_key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_key';

userRouter.post('/email-verification', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: '이메일을 입력해주세요.' });
  }

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6자리 인증번호 생성
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5분 후 만료

  try {
    // 기존 인증번호 삭제 또는 업데이트
    await VerificationModel.createVerification(email, verificationCode, expiresAt);

    // 이메일 전송 로직
    await sendEmail(email, `인증번호: ${verificationCode}`);

    res.status(200).json({ message: '인증번호가 이메일로 전송되었습니다.', status: 200 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.', status: 500 });
  }
});

userRouter.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, nickname, password, confirmPassword, authNumber } = req.body;

    if (!email || !nickname || !password || !confirmPassword) {
      return res.status(400).json({
        message: '이메일, 닉네임, 비밀번호, 그리고 비밀번호 확인은 필수입니다.',
        status: 400,
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
        status: 400,
      });
    }
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        message: '이미 등록된 이메일입니다.',
        status: 409,
      });
    }
    const existingNickname = await UserModel.findByNickname(nickname);
    if (existingNickname) {
      return res.status(409).json({
        message: '이미 사용 중인 닉네임입니다.',
        status: 409,
      });
    }

    // 인증번호 확인
    const verification = await VerificationModel.findByEmail(email);

    if (!verification) {
      return res.status(404).json({ message: '인증 기록이 존재하지 않습니다.' });
    }

    if (verification.is_verified) {
      return res.status(400).json({ message: '이미 인증된 이메일입니다.' });
    }

    if (verification.verification_code !== authNumber) {
      return res.status(400).json({ message: '인증번호가 올바르지 않습니다.' });
    }

    if (new Date() > new Date(verification.expires_at)) {
      return res.status(400).json({ message: '인증번호가 만료되었습니다.' });
    }

    // 인증 상태 업데이트
    await VerificationModel.verifyEmail(email);

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
      email,
      nickname,
      password: hashedPassword,
    });

    res.status(201).json({
      message: '회원가입이 성공적으로 완료되었습니다.',
      status: 201,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: '서버 내부 오류가 발생했습니다.',
      status: 500,
    });
  }
});

userRouter.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: '이메일과 비밀번호는 필수입니다.',
        status: 400,
      });
    }

    const user = await UserModel.findByEmail(email);

    if (!user) {
      return res.status(404).json({
        message: '등록되지 않은 사용자입니다.',
        status: 404,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        status: 400,
      });
    }

    // 액세스 토큰 생성
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' } // 15분 만료
    );

    // 리프레시 토큰 생성
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '30d' } // 7일 만료
    );

    // 리프레시 토큰을 HttpOnly 쿠키로 설정
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // 클라이언트 스크립트 접근 차단
      secure: process.env.NODE_ENV === 'production', // HTTPS에서만 전송
      sameSite: 'strict', // 동일 출처에서만 전송
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30일 (밀리초 단위)
    });

    res.json({
      message: '로그인에 성공했습니다.',
      status: 200,
      data: {
        email: user.email,
        nickname: user.nickname,
        accessToken,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: '서버 내부 오류가 발생했습니다.',
      status: 500,
    });
  }
});

userRouter.post('/signout', async (req: Request, res: Response) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      message: '로그아웃되었습니다.',
      status: 200,
    });
  } catch (error) {
    console.error('로그아웃 처리 중 오류 발생:', error);
    res.status(500).json({
      message: '서버 내부 오류가 발생했습니다.',
      status: 500,
    });
  }
});

userRouter.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: '리프레시 토큰이 제공되지 않았습니다.',
        status: 401,
      });
    }

    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { id: string; email: string };

    const newAccessToken = jwt.sign({ id: decoded.id, email: decoded.email }, ACCESS_TOKEN_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({
      message: '새로운 액세스 토큰이 발급되었습니다.',
      status: 200,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    console.error('리프레시 토큰 검증 실패:', error);
    res.status(403).json({
      message: '유효하지 않거나 만료된 리프레시 토큰입니다.',
      status: 403,
    });
  }
});

userRouter.get('/all', authenticate, async (req: Request, res: Response) => {
  try {
    res.json({
      data: await UserModel.all(),
    });
  } catch (error) {
    res.status(500).json({
      message: '서버 내부 오류가 발생했습니다.',
      status: 500,
    });
  }
});

export default userRouter;
