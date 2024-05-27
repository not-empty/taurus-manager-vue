import { injectable, inject } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import IHashProvider from '../providers/HashProvider/models/IHashProvider';
import { UserRepository, User } from '../repositories/UserRepository';

interface IRequest {
  name: string;
  login: string;
  password: string;
  role: string;
}

@injectable()
class CreateUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository,

    @inject('HashProvider')
    private hashProvider: IHashProvider,
  ) {}

  public async execute({
    name,
    login,
    password,
    role,
  }: IRequest): Promise<User | undefined> {
    const userExists = await this.userRepository.getByLogin(login);
    if (userExists) {
      throw new CustomError('User already exists', 400);
    }

    const hashedPassword = await this.hashProvider.generate(password);

    const userId = await this.userRepository.insert({
      name,
      login,
      password: hashedPassword,
      role,
      allowAll: 1
    });

    const user = await this.userRepository.getById(userId) as User;

    return user;
  }
}

export default CreateUserService;
