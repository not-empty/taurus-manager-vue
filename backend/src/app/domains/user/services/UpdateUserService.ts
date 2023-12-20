import { injectable, inject } from "tsyringe";
import CustomError from "../../../errors/CustomError";
import IGroupRepository from "../../group/repositories/models/IGroupRepository";
import IHashProvider from "../providers/HashProvider/models/IHashProvider";
import IUserRepository from "../repositories/models/IUserRepository";
import User from "../entities/User";

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
    private userRepository: IUserRepository,

    @inject("GroupRepository")
    private groupRepository: IGroupRepository,

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
  }: IRequest): Promise<User> {
    const user = await this.userRepository.find(id);
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
      user.groups = '';
    }

    if (password) {
      user.password = await this.hashProvider.generate(password);
    }

    await this.userRepository.save(user);

    return user;
  }
}

export default UpdateUserService;
