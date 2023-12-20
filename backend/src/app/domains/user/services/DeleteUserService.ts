import { injectable, inject } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import IUserRepository from '../repositories/models/IUserRepository';

@injectable()
class DeleteUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: IUserRepository,
  ) {}

  public async execute(id: string): Promise<boolean> {
    const user = await this.userRepository.find(id);
    if (!user) {
      throw new CustomError('User not found', 404);
    }
    const result = await this.userRepository.delete(id);
    return result;
  }
}

export default DeleteUserService;
