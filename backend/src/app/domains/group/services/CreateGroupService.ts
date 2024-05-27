import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import GroupRepository, { Group } from '../repositories/GroupRepository';

interface IRequest {
  name: string;
  description?: string;
}

@injectable()
class CreateGroupService {
  constructor(
    @inject('GroupRepository')
    private groupRepository: GroupRepository,
  ) {
    //
  }

  public async execute({
    name,
    description,
  }: IRequest): Promise<Group> {
    const groupExists = await this.groupRepository.getByName(name);
    if (groupExists) {
      throw new CustomError('Group already exists', 400);
    }

    const groupId = await this.groupRepository.insert({
      name,
      description,
    });

    const group = await this.groupRepository.getById(groupId);
    return group as Group;
  }
}

export default CreateGroupService;
