import { BaseEntity, BaseRepository } from "../../../core/BaseRepository";

export interface User extends BaseEntity {
  name: string,
  login: string,
  password: string,
  role: string,
  allowAll: number,
  groups?: string | null,
}

export class UserRepository extends BaseRepository<User> {
  public tableName: string = 'user';

  public async getByLogin(login: string): Promise<User | null> {
    const data = await this.db<User>(this.tableName)
      .select('*')
      .where({ login })
      .limit(1)
      .first();
    
    return data || null;
  }
}

export default UserRepository;
