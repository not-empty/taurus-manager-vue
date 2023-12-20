import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';
import SessionController from '../controllers/SessionController';

const router = Router();
const sessionController = new SessionController();

router.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      login: Joi.string().required(),
      password: Joi.string().required(),
    },
  }),
  sessionController.create,
);

export default router;
