import { Router } from 'express';
import { UserModel } from 'src/models/user-model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';

const userRouter = Router();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret_key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_key';

const refreshTokens: string[] = [];

userRouter.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and Password are required',
      });
    }

    const user = await UserModel.findByEmail(email);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password',
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
      message: 'Login successful',
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal Server Error',
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
      message: 'Internal Server Error',
    });
  }
});

export default userRouter;
