import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import GroupRepository, { Group } from '../repositories/GroupRepository';

@injectable()
class ShowGroupService {
  constructor(
    @inject('GroupRepository')
    private groupRepository: GroupRepository,
  ) {
    //
  }

  public async execute(id: string): Promise<Group> {
    const group = await this.groupRepository.getById(id);
    if (!group) {
      throw new CustomError('Group not found', 404);
    }

    return group;
  }
}

export default ShowGroupService;
