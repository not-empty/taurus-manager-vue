import { injectable, inject } from 'tsyringe';
import { UserRepository, User } from '../repositories/UserRepository';
import { Filter, OrderBy } from '../../../core/BaseRepository';

interface IRequest {
  page?: number;
  size?: number;
  filters?: Filter<User>[];
  order?: OrderBy<User>;
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
    filters,
    order,
  }: IRequest): Promise<IResponse> {
    const total = await this.userRepository.count();
    const users = await this.userRepository.list({
      page,
      limit: size,
      filters,
      order,
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
