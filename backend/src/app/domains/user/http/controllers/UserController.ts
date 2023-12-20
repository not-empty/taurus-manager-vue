import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { instanceToInstance } from 'class-transformer';
import CreateUserService from '../../services/CreateUserService';
import ListUserService from '../../services/ListUserService';
import ShowUserService from '../../services/ShowUserService';
import UpdateUserService from '../../services/UpdateUserService';
import DeleteUserService from '../../services/DeleteUserService';

class UserController {
  public async create(request: Request, response: Response): Promise<Response> {
    const {
      name,
      login,
      password,
      role,
    } = request.body;
    const createUser = container.resolve(CreateUserService);
    const user = await createUser.execute({
      name,
      login,
      password,
      role,
    });
    return response.json(instanceToInstance(user));
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const {
      id,
    } = request.params;
    const deleteUser = container.resolve(DeleteUserService);
    const result = await deleteUser.execute(String(id));
    return response.json(result);
  }

  public async list(request: Request, response: Response): Promise<Response> {
    const {
      page,
      size,
    } = request.query;
    const listUser = container.resolve(ListUserService);
    const users = await listUser.execute({
      page: page ? Number(page) : undefined,
      size: size ? Number(size) : undefined,
    });
    return response.json(instanceToInstance(users));
  }

  public async show(request: Request, response: Response): Promise<Response> {
    const {
      id,
    } = request.params;
    const showUser = container.resolve(ShowUserService);
    const user = await showUser.execute(String(id));
    return response.json(instanceToInstance(user));
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const {
      id,
    } = request.params;
    const {
      name,
      login,
      password,
      role,
      allowAll,
      groups,
    } = request.body;
    const updateUser = container.resolve(UpdateUserService);
    const user = await updateUser.execute({
      id: String(id),
      name,
      login,
      password,
      role,
      allowAll,
      groups,
    });
    return response.json(instanceToInstance(user));
  }
}

export default UserController;
