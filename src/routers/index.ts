import { Router } from 'express';
import userRouter from './user-router';

const router = Router();

// -- Auth
router.use('/user', userRouter);

export default router;
