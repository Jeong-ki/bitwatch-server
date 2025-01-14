import { Router } from 'express';
import postRouter from './post-router';
import userRouter from './user-router';

const router = Router();

// -- Auth
router.use('/user', userRouter);

// -- Test
router.use('/post', postRouter);

export default router;
