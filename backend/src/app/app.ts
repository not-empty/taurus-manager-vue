import 'reflect-metadata';
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { errors } from 'celebrate';
import 'express-async-errors';
import cookieParser from 'cookie-parser';

import '../database';
import './container';

import routes from './routes';
import CustomError from './errors/CustomError';

import corsConfig from "../config/cors";

const app = express();

const corsOptions = {
  origin: corsConfig.cors.origin,
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin, Access-Control-Allow-Credentials, Access-Control-Allow-Headers', // Custom headers
};

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(routes);
app.use(errors());

app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  if (err instanceof CustomError) {
    return response.status(err.statusCode).json({
      message: err.text,
    });
  }

  return response.status(500).json({
    message: 'Internal Server Error',
    error: err,
  });
});

export default app;
