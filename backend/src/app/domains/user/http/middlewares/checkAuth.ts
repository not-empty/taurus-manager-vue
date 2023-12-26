import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import authConfig from "../../../../../config/auth";
import CustomError from "../../../../errors/CustomError";

interface ITokenPayload {
  iat: number;
  exp: number;
  sub: string;
}

interface ITokenSubject {
  id: string;
  role: string;
  groups: string[];
}

const checkAuth = (request: Request, _: Response, next: NextFunction): void => {
  const token = request.cookies['token'];

  if (!token) {
    throw new CustomError("Missing valid JWT token.", 401);
  }

  try {
    const decoded = verify(token, authConfig.jwt.secret);
    const { sub } = decoded as ITokenPayload;
    const user = JSON.parse(sub) as ITokenSubject;

    request.user = user;

    return next();
  } catch {
    throw new CustomError("Invalid JWT token.", 401);
  }
};

export default checkAuth;
