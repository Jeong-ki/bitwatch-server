import { Router } from 'express';
import { UserModel } from 'src/models/user-model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import { VerificationModel } from 'src/models/verification-model';
import { sendEmail } from 'src/middleware/verification-email';

const userRouter = Router();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret_key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_key';

const refreshTokens: string[] = [];

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
      return res.status(401).json({
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        status: 401,
      });
    }

    // 액세스 토큰 생성
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' } // 15분 만료
    );

    // 리프레시 토큰 생성
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' } // 7일 만료
    );

    // 리프레시 토큰 저장 (DB 또는 메모리에 저장)
    refreshTokens.push(refreshToken);

    res.json({
      message: '로그인에 성공했습니다.',
      status: 200,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({
      message: '서버 내부 오류가 발생했습니다.',
      status: 500,
    });
  }
});

userRouter.get('/', async (req: Request, res: Response) => {
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
