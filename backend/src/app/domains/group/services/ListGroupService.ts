import { inject, injectable } from 'tsyringe';
import Group from '../entities/Group';
import IGroupRepository from '../repositories/models/IGroupRepository';

interface IRequest {
  page?: number;
  size?: number;
}

interface IResponse {
  total: number;
  groups: Group[];
}

@injectable()
class ListGroupService {
  constructor(
    @inject('GroupRepository')
    private groupRepository: IGroupRepository,
  ) {}

  public async execute({
    page,
    size,
  }: IRequest): Promise<IResponse> {
    const total = await this.groupRepository.count();
    const groups = await this.groupRepository.findAll(
      page,
      size,
    );

    return {
      total,
      groups,
    };
  }
}

export default ListGroupService;
