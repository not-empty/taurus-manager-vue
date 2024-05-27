import { inject, injectable } from 'tsyringe';
import GroupRepository, { Group } from '../repositories/GroupRepository';

interface IRequest {
  page?: number;
  size?: number;
}

interface IResponse {
  total: number;
  data: Group[];
}

@injectable()
class ListGroupService {
  constructor(
    @inject('GroupRepository')
    private groupRepository: GroupRepository,
  ) {}

  public async execute({
    page,
    size,
  }: IRequest): Promise<IResponse> {
    const total = await this.groupRepository.count();
    const groups = await this.groupRepository.list({
      page,
      limit: size,
    });

    return {
      total,
      data: groups.data,
    };
  }
}

export default ListGroupService;
