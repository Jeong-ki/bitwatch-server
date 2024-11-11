import { Router } from 'express';
import { UserModel } from 'src/models/user-model';
import type { Request, Response } from 'express';

const userRouter = Router();

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
