import { injectable, inject } from 'tsyringe';
import User from '../entities/User';
import IUserRepository from '../repositories/models/IUserRepository';

interface IRequest {
  page?: number;
  size?: number;
}

interface IResponse {
  total: number;
  users: User[];
}

@injectable()
class ListUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: IUserRepository,
  ) {}

  public async execute({
    page,
    size,
  }: IRequest): Promise<IResponse> {
    const total = await this.userRepository.count();
    const users = await this.userRepository.findAll(
      page,
      size,
    );

    return {
      total,
      users,
    };
  }
}

export default ListUserService;
