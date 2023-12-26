import { Request, Response } from "express";
import { container } from "tsyringe";
import AuthenticateUserService from "../../services/AuthenticateUserService";
import { CookieOptions } from 'express';
import nodeEnvConfig from "../../../../../config/node";

class SessionController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { login, password } = request.body;
    const authenticateUser = container.resolve(AuthenticateUserService);
    const { token } = await authenticateUser.execute({
      login,
      password,
    });

    const maxAge = 8 * 60 * 60 * 1000;

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: nodeEnvConfig.environment === 'production',
      maxAge: maxAge,
      sameSite: 'strict' as const,
    };
    response.cookie('token', token, cookieOptions);

    return response.json({
      success: true,
    });
  }
}

export default SessionController;
