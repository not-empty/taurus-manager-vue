import AppDataSource from '../../../../database';
import { In, Repository } from 'typeorm';
import ICreateGroupDTO from '../dtos/ICreateGroupDTO';
import Group from '../entities/Group';
import IGroupRepository from './models/IGroupRepository';

class GroupRepository implements IGroupRepository {
  private ormRepository: Repository<Group>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Group);
  }

  public async count(): Promise<number> {
    return this.ormRepository.count();
  }

  public async create({
    name,
    description,
  }: ICreateGroupDTO): Promise<Group> {
    const group = this.ormRepository.create({
      name,
      description,
    });
    await this.ormRepository.save(group);

    return group;
  }

  public async delete(id: string): Promise<boolean> {
    await this.ormRepository.softDelete(id);
    return true;
  }

  public async find(id: string): Promise<Group | null> {
    const group = await this.ormRepository.findOneBy(
      {
      'id': id
      }
    );
    return group;
  }

  public async findAll(
    page?: number,
    size?: number,
  ): Promise<Group[]> {
    return this.ormRepository.find({
      where: {},
      order: {
        createdAt: 'ASC',
      },
      take: size || undefined,
      skip: (page && size) ? (page - 1) * size : undefined,
    });
  }

  public async findByIds(ids: string[]): Promise<Group[]> {
    return this.ormRepository.find(
      {
        where: {
          id: In(ids)
        },
        order: {
          id: 'ASC'
        }
      })
    ;
  }

  public async findByName(name: string): Promise<Group | null> {
    const group = await this.ormRepository.findOne({
      where: {
        name,
      },
    });

    return group;
  }

  public async save(group: Group): Promise<Group> {
    return this.ormRepository.save(group);
  }
}

export default GroupRepository;
