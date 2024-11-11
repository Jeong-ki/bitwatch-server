import { Router } from 'express';
import postRouter from './post-router';
import userRouter from './user-router';

const router = Router();

// -- Auth
router.use('/users', userRouter);

// -- Test
router.use('/posts', postRouter);

export default router;
