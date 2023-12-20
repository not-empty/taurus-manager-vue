import ICreateUserDTO from '../../dtos/ICreateUserDTO';
import User from '../../entities/User';

interface IUserRepository {
  count(): Promise<number>;
  create(data: ICreateUserDTO): Promise<User>;
  delete(id: string): Promise<boolean>;
  find(id: string): Promise<User | null>;
  findAll(page?: number, size?: number): Promise<User[]>;
  findByLogin(login: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

export default IUserRepository;
