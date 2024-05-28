import { injectable, inject } from 'tsyringe';
import { sign } from 'jsonwebtoken';
import CustomError from '../../../errors/CustomError';
import IHashProvider from '../providers/HashProvider/models/IHashProvider';
import authConfig from '../../../../config/auth';
import UserRepository, { User } from '../repositories/UserRepository';

interface IRequest {
  login: string;
  password: string;
}

interface IResponse {
  user: User;
  token: string;
}

interface ITokenSubject {
  id: string;
  role: string;
  groups?: string;
}

@injectable()
class AuthenticateUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository,

    @inject('HashProvider')
    private hashProvider: IHashProvider
  ) {
    //
  }

  public async execute({ login, password }: IRequest): Promise<IResponse> {
    const user = await this.userRepository.getByLogin(login);

    if (!user) {
      throw new CustomError('Incorrect login or password', 401);
    }

    const passwordCompare = await this.hashProvider.compare(
      password,
      user.password
    );

    if (!passwordCompare) {
      throw new CustomError('Incorrect login or password', 401);
    }

    const { secret, expiresIn } = authConfig.jwt;

    const subject = {
      id: user.id,
      role: user.role,
    } as ITokenSubject;

    if (user.groups) {
      subject.groups = JSON.parse(user.groups || '[]');
    }

    const token = sign({}, secret, {
      subject: JSON.stringify(subject),
      expiresIn,
    });

    return {
      user,
      token,
    };
  }
}

export default AuthenticateUserService;
