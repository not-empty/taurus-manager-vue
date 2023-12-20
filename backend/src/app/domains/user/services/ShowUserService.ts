import { injectable, inject } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import User from '../entities/User';
import IUserRepository from '../repositories/models/IUserRepository';

@injectable()
class ShowUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: IUserRepository,
  ) {}

  public async execute(id: string): Promise<User> {
    const user = await this.userRepository.find(id);
    if (!user) {
      throw new CustomError('User not found', 404);
    }
    return user;
  }
}

export default ShowUserService;
