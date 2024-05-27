import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import GroupRepository, { Group } from '../repositories/GroupRepository';

interface IRequest {
  id: string;
  name?: string;
  description?: string;
}

@injectable()
class UpdateGroupService {
  constructor(
    @inject('GroupRepository')
    private groupRepository: GroupRepository,
  ) {}

  public async execute({
    id,
    name,
    description,
  }: IRequest): Promise<Group> {
    const group = await this.groupRepository.getById(id);
    if (!group) {
      throw new CustomError('Group not found', 404);
    }

    group.name = name || group.name;
    group.description = description || group.description;

    await this.groupRepository.update(id, group);

    return group;
  }
}

export default UpdateGroupService;
