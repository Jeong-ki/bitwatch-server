import { Router } from 'express';
import { PostModel } from 'src/models/post-model';
import type { Request, Response } from 'express';
import type { PostType } from 'src/models/post-model';

const postRouter = Router();

postRouter.get('/:id', async (req: Request, res: Response) => {
  if (!req.params.id) {
    return res.status(400).json({
      message: 'Bad Request',
    });
  }

  try {
    res.json({
      data: await PostModel.findById<PostType>(req.params.id),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal Server Error',
    });
  }
});

export default postRouter;
