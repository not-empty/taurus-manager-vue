import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import Group from '../entities/Group';
import IGroupRepository from '../repositories/models/IGroupRepository';

interface IRequest {
  name: string;
  description?: string;
}

@injectable()
class CreateGroupService {
  constructor(
    @inject('GroupRepository')
    private groupRepository: IGroupRepository,
  ) {}

  public async execute({
    name,
    description,
  }: IRequest): Promise<Group> {
    const groupExists = await this.groupRepository.findByName(name);
    if (groupExists) {
      throw new CustomError('Group already exists', 400);
    }

    const group = await this.groupRepository.create({
      name,
      description,
    });

    return group;
  }
}

export default CreateGroupService;
