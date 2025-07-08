import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';
import UserController from '../controllers/UserController';
import checkAuth from '../middlewares/checkAuth';

const router = Router();
const userController = new UserController();

router.use(checkAuth);

router.post(
  '/validate',
  userController.validate,
);

router.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      login: Joi.string().required(),
      password: Joi.string().required(),
      role: Joi.string().required(),
    },
  }),
  userController.create,
);

router.get(
  '/',
  celebrate({
    [Segments.QUERY]: Joi.object({
      page: Joi.number().optional(),
      size: Joi.number().optional(),
      order: Joi.string()
        .pattern(/^[a-zA-Z0-9_]+,(asc|desc)$/)
        .optional(),
    })
      .pattern(/^filter_/, Joi.string().required())
      .unknown(false),
  }),
  userController.list,
);

router.get(
  '/:id',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().required(),
    },
  }),
  userController.show,
);

router.put(
  '/:id',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().required(),
    },
    [Segments.BODY]: {
      name: Joi.string(),
      login: Joi.string(),
      password: Joi.string().allow(null, ''),
      role: Joi.string(),
    },
  }, {
    allowUnknown: true,
  }),
  userController.update,
);

router.delete(
  '/:id',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().required(),
    },
  }),
  userController.delete,
);

export default router;
