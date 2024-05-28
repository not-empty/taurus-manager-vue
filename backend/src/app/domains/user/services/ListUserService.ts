import { injectable, inject } from 'tsyringe';
import { UserRepository, User } from '../repositories/UserRepository';

interface IRequest {
  page?: number;
  size?: number;
}

interface IResponse {
  total: number;
  data: User[];
}

@injectable()
class ListUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository,
  ) {
    //
  }

  public async execute({
    page,
    size,
  }: IRequest): Promise<IResponse> {
    const total = await this.userRepository.count();
    const users = await this.userRepository.list({
      page,
      limit: size,
      fields: [
        'id',
        'name',
        'login',
        'role',
        'allowAll',
        'groups',
        'updatedAt',
        'deletedAt',
        'createdAt',
      ],
    });

    return {
      total,
      data: users.data,
    };
  }
}

export default ListUserService;
