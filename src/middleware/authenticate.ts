import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || '';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 401,
      message: '접근이 거부되었습니다. 토큰이 존재하지 않습니다.',
    });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as { id: string; email: string };

    req.user = decoded;
    next();
  } catch (error) {
    console.error('authenticate', error);
    res.status(401).json({
      status: 401,
      message: '잘못된 토큰입니다.',
    });
  }
};
