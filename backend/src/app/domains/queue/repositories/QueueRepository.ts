import AppDataSource from "../../../../database";
import { In, Repository } from "typeorm";
import ICreateQueueDTO from "../dtos/ICreateQueueDTO";
import Queue from "../entities/Queue";
import IQueueRepository from "./models/IQueueRepository";

class QueueRepository implements IQueueRepository {
  private ormRepository: Repository<Queue>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Queue);
  }

  public async count(): Promise<number> {
    return this.ormRepository.count();
  }

  public async create({
    name,
    description,
    compliance,
    host,
    port,
    health_value,
    groupId,
  }: ICreateQueueDTO): Promise<Queue> {
    const queue = this.ormRepository.create({
      name,
      description,
      compliance,
      host,
      port,
      health_value,
      groupId,
    });
    await this.ormRepository.save(queue);
    return queue;
  }

  public async delete(id: string): Promise<boolean> {
    await this.ormRepository.softDelete(id);
    return true;
  }

  public async find(id: string): Promise<Queue | null> {
    const queue = await this.ormRepository.findOneBy({
      id: id,
    });
    return queue;
  }

  public async findAll(page?: number, size?: number): Promise<Queue[]> {
    const queues = await this.ormRepository.find({
      where: {},
      relations: ["group"],
      order: {
        id: "ASC",
      },
      take: size || undefined,
      skip: page && size ? (page - 1) * size : undefined,
    });
    return queues;
  }

  public async findByGroup(groupId: string): Promise<Queue[]> {
    if (!groupId) {
      return this.ormRepository.find();
    }
    const queues = await this.ormRepository.find({
      where: {
        groupId,
      },
      relations: ["group"],
      order: {
        id: "ASC",
      },
    });
    return queues;
  }

  public async findByIds(ids: string[]): Promise<Queue[]> {
    const queues = await this.ormRepository.find({
      where: {
        id: In(ids),
      },
      order: {
        id: "ASC",
      },
    });
    return queues;
  }

  public async save(queue: Queue): Promise<Queue> {
    return this.ormRepository.save(queue);
  }
}

export default QueueRepository;
