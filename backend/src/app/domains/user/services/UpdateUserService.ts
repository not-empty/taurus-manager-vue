import { injectable, inject } from "tsyringe";
import CustomError from "../../../errors/CustomError";
import IHashProvider from "../providers/HashProvider/models/IHashProvider";
import UserRepository, { User } from "../repositories/UserRepository";
import { MakeOptional } from "../../../utils/types";

interface IRequest {
  id: string;
  name?: string;
  login?: string;
  password?: string;
  role?: string;
  allowAll?: number;
  groups?: string;
}

@injectable()
class UpdateUserService {
  constructor(
    @inject("UserRepository")
    private userRepository: UserRepository,

    @inject("HashProvider")
    private hashProvider: IHashProvider
  ) {}

  public async execute({
    id,
    name,
    login,
    password,
    role,
    allowAll,
    groups,
  }: IRequest): Promise<MakeOptional<User, 'password'>> {
    const user = await this.userRepository.getById(id) as MakeOptional<User, 'password'>;
  
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    user.name = name || user.name;
    user.login = login || user.login;
    user.role = role || user.role;

    if (allowAll == 0 || allowAll == 1) {
      user.allowAll = allowAll;
    }

    if (groups && allowAll == 0) {
      user.groups = groups;
    }

    if (allowAll == 1) {
      user.groups = null;
    }

    if (password) {
      user.password = await this.hashProvider.generate(password);
    }

    await this.userRepository.update(id, user);

    delete user.password;

    return user;
  }
}

export default UpdateUserService;
