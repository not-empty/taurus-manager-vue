import { inject, injectable } from "tsyringe";
import Queue from "../entities/Queue";
import IQueueRepository from "../repositories/models/IQueueRepository";

interface IRequest {
  name: string;
  description?: string;
  compliance?: string;
  host: string;
  port: number;
  health_value: number;
  groupId: string;
}

@injectable()
class CreateQueueService {
  constructor(
    @inject("QueueRepository")
    private queueRepository: IQueueRepository
  ) {}

  public async execute({
    name,
    description,
    compliance,
    host,
    port,
    health_value,
    groupId,
  }: IRequest): Promise<Queue> {
    const queue = await this.queueRepository.create({
      name,
      description,
      compliance,
      host,
      port,
      health_value,
      groupId,
    });
    await this.queueRepository.save(queue);
    return queue;
  }
}

export default CreateQueueService;
