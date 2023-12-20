import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import Group from '../entities/Group';
import IGroupRepository from '../repositories/models/IGroupRepository';

@injectable()
class ShowGroupService {
  constructor(
    @inject('GroupRepository')
    private groupRepository: IGroupRepository,
  ) {}

  public async execute(id: string): Promise<Group> {
    const group = await this.groupRepository.find(id);
    if (!group) {
      throw new CustomError('Group not found', 404);
    }

    return group;
  }
}

export default ShowGroupService;
