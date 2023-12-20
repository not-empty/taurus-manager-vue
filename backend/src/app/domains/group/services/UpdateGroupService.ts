import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import Group from '../entities/Group';
import IGroupRepository from '../repositories/models/IGroupRepository';

interface IRequest {
  id: string;
  name?: string;
  description?: string;
}

@injectable()
class UpdateGroupService {
  constructor(
    @inject('GroupRepository')
    private groupRepository: IGroupRepository,
  ) {}

  public async execute({
    id,
    name,
    description,
  }: IRequest): Promise<Group> {
    const group = await this.groupRepository.find(id);
    if (!group) {
      throw new CustomError('Group not found', 404);
    }

    group.name = name || group.name;
    group.description = description || group.description;

    await this.groupRepository.save(group);

    return group;
  }
}

export default UpdateGroupService;
