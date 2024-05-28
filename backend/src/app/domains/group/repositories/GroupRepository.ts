import { BaseEntity, BaseRepository } from '../../../core/BaseRepository';

export interface Group extends BaseEntity {
  name: string,
  description?: string
}

export class GroupRepository extends BaseRepository<Group> {
  public tableName: string = 'group';

  public async getByName(name: string): Promise<Group | null> {
    const data = await this.db<Group>(this.tableName)
      .select('*')
      .where({ name })
      .limit(1)
      .first();

    return data || null;
  }
}

export default GroupRepository;
