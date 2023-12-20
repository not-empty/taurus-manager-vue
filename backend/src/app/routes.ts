import { Router } from 'express';

import groupRoutes from './domains/group/http/routes/group.routes';
import queueRoutes from './domains/queue/http/routes/queue.routes';
import sessionRoutes from './domains/user/http/routes/session.routes';
import userRoutes from './domains/user/http/routes/user.routes';

const router = Router();

router.use('/group', groupRoutes);
router.use('/queue', queueRoutes);
router.use('/session', sessionRoutes);
router.use('/user', userRoutes);

export default router;
