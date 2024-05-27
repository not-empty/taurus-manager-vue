import { injectable, inject } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import UserRepository, { User } from '../repositories/UserRepository';

@injectable()
class ShowUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository,
  ) {}

  public async execute(id: string): Promise<User> {
    const user = await this.userRepository.getById(id);
    if (!user) {
      throw new CustomError('User not found', 404);
    }
    return user;
  }
}

export default ShowUserService;
