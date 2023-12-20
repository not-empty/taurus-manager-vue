import { Request, Response } from "express";
import { container } from "tsyringe";
import { instanceToInstance } from "class-transformer";
import AuthenticateUserService from "../../services/AuthenticateUserService";

class SessionController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { login, password } = request.body;
    const authenticateUser = container.resolve(AuthenticateUserService);
    const { user, token } = await authenticateUser.execute({
      login,
      password,
    });

    return response.json({
      user: instanceToInstance(user),
      token,
    });
  }
}

export default SessionController;
