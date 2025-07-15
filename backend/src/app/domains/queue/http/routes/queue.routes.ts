import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';
import QueueController from '../controllers/QueueController';
import checkAuth from '../../../user/http/middlewares/checkAuth';

const router = Router();
const queueController = new QueueController();

router.use(checkAuth);

router.post(
  '/:id/job/:jobId/clone',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().required(),
      jobId: Joi.string().required(),
    },
  }),
  queueController.cloneJob,
);

router.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      host: Joi.string().required(),
      port: Joi.number().required(),
      healthValue: Joi.number().required(),
      groupId: Joi.string().required(),
      description: Joi.string().allow(null, ''),
      compliance: Joi.string().allow(null, ''),
    },
  }),
  queueController.create,
);

router.post(
  '/import',
  celebrate({
    [Segments.BODY]: {
      host: Joi.string().required(),
      port: Joi.number().required(),
      groupId: Joi.string().required(),
      password: Joi.string().required(),
      healthValue: Joi.number().optional(),
    },
  }),
  queueController.import,
);

router.post(
  '/:id/job',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().required(),
    },
    [Segments.BODY]: {
      data: Joi.object().required(),
    },
  }),
  queueController.createJob,
);

router.delete(
  '/:id',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().required(),
    },
  }),
  queueController.delete,
);

router.delete(
  '/:id/job',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().required(),
    },
    [Segments.BODY]: {
      jobIds: Joi.array().items(Joi.string().required()).required(),
    },
  }),
  queueController.deleteJob,
);

router.get(
  '/:queueId/job/:jobId/export',
  celebrate({
    [Segments.PARAMS]: {
      queueId: Joi.string().required(),
      jobId: Joi.string().required(),
    },
  }),
  queueController.exportJob,
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
  queueController.list,
);

router.get(
  '/:id/job',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().required(),
    },
    [Segments.QUERY]: {
      state: Joi.string().required(),
      page: Joi.number().required(),
      size: Joi.number().required(),
    },
  }),
  queueController.listJobs,
);

router.put(
  '/:id/pause',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().required(),
    },
  }),
  queueController.pause,
);

router.put(
  '/pause',
  celebrate({
    [Segments.BODY]: {
      ids: Joi.array().items(Joi.string().required()).required(),
    },
  }),
  queueController.pauseBulk,
);

router.put(
  '/:id/resume',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().required(),
    },
  }),
  queueController.resume,
);

router.put(
  '/resume',
  celebrate({
    [Segments.BODY]: {
      ids: Joi.array().items(Joi.string().required()).required(),
    },
  }),
  queueController.resumeBulk,
);

router.post(
  '/:id/job/retry',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().required(),
    },
    [Segments.BODY]: {
      jobIds: Joi.array().items(Joi.string().required()).required(),
      state: Joi.string(),
    },
  }),
  queueController.retryJobs,
);

router.post(
  '/:id/job/retry-all',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().required(),
    },
  }),
  queueController.retryAllJobs,
);

router.get(
  '/:id',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().required(),
    },
  }),
  queueController.show,
);

router.get(
  '/:id/dashboard',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().required(),
    },
  }),
  queueController.showDashboard,
);

router.get(
  '/:queueId/job/:jobId',
  celebrate({
    [Segments.PARAMS]: {
      queueId: Joi.string().required(),
      jobId: Joi.string().required(),
    },
  }),
  queueController.showJob,
);

router.put(
  '/:id',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().required(),
    },
    [Segments.BODY]: {
      name: Joi.string(),
      host: Joi.string(),
      port: Joi.number(),
      groupId: Joi.string(),
      description: Joi.string().allow(null, ''),
      compliance: Joi.string().allow(null, ''),
      healthValue: Joi.number().required(),
    },
  }, {
    allowUnknown: true,
  }),
  queueController.update,
);

router.post(
  '/batch',
  celebrate({
    [Segments.BODY]: Joi.object({
      ids: Joi.array().items(Joi.string().required()).required(),
      data: Joi.object({
        groupId: Joi.string(),
        healthValue: Joi.number(),
        description: Joi.string().allow(null, ''),
        host: Joi.string(),
        port: Joi.number(),
      }),
    }),
  }),
  queueController.batchUpdate,
);

export default router;
