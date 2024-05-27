import { injectable, inject } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import UserRepository from '../repositories/UserRepository';

@injectable()
class DeleteUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository,
  ) {}

  public async execute(id: string): Promise<boolean> {
    const user = await this.userRepository.getById(id);
    if (!user) {
      throw new CustomError('User not found', 404);
    }
    const result = await this.userRepository.delete(id);
    return result;
  }
}

export default DeleteUserService;
