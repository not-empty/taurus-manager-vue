import { Router, Request, Response } from 'express';

import groupRoutes from './domains/group/http/routes/group.routes';
import queueRoutes from './domains/queue/http/routes/queue.routes';
import sessionRoutes from './domains/user/http/routes/session.routes';
import userRoutes from './domains/user/http/routes/user.routes';

const router = Router();

router.get('/health', async (_: Request, response: Response) => {
  response.send({
    message: 'OK',
  });
});

router.use('/group', groupRoutes);
router.use('/queue', queueRoutes);
router.use('/session', sessionRoutes);
router.use('/user', userRoutes);

export default router;
