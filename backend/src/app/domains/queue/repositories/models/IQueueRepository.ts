import ICreateQueueDTO from "../../dtos/ICreateQueueDTO";
import Queue from "../../entities/Queue";

interface IQueueRepository {
  count(): Promise<number>;
  create(data: ICreateQueueDTO): Promise<Queue>;
  delete(id: string): Promise<boolean>;
  find(id: string): Promise<Queue | null>;
  findAll(page?: number, size?: number): Promise<Queue[]>;
  findByGroup(groupId: string): Promise<Queue[]>;
  findByIds(ids: string[]): Promise<Queue[]>;
  save(queue: Queue): Promise<Queue>;
}

export default IQueueRepository;
