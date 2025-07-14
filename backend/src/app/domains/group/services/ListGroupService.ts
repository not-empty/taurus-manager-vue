import { inject, injectable } from 'tsyringe';
import GroupRepository, { Group } from '../repositories/GroupRepository';
import { Filter, OrderBy } from '../../../core/BaseRepository';

interface IRequest {
  page?: number;
  size?: number;
  filters?: Filter<Group>[];
  order?: OrderBy<Group>;
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
  ) {
    //
  }

  public async execute({
    page,
    size,
    filters,
    order,
  }: IRequest): Promise<IResponse> {
    const total = await this.groupRepository.count();
    const groups = await this.groupRepository.list({
      page,
      limit: size,
      filters,
      order,
    });

    return {
      total,
      data: groups.data,
    };
  }
}

export default ListGroupService;
