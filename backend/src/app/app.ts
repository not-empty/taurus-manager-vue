import 'reflect-metadata';
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { errors } from 'celebrate';
import 'express-async-errors';

import '../database';
import './container';

import routes from './routes';
import CustomError from './errors/CustomError';

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);
app.use(errors());

app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  if (err instanceof CustomError) {
    return response.status(err.statusCode).json({
      message: err.text,
    });
  }
  console.log(err);

  return response.status(500).json({
    message: 'Internal Server Error',
    error: err,
  });
});

export default app;
