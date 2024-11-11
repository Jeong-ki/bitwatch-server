import { Router } from 'express';
import postRouter from './post-router';
import userRouter from './user-router';

const router = Router();

router.use('/users', userRouter);
router.use('/posts', postRouter);

export default router;
