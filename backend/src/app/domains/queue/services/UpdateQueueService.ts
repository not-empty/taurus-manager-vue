import { inject, injectable } from "tsyringe";
import CustomError from "../../../errors/CustomError";
import Queue from "../entities/Queue";
import IQueueRepository from "../repositories/models/IQueueRepository";

interface IRequest {
  id: string;
  name?: string;
  description?: string;
  compliance?: string;
  host?: string;
  port?: number;
  health_value?: number;
  groupId?: string;
}

@injectable()
class UpdateQueueService {
  constructor(
    @inject("QueueRepository")
    private queueRepository: IQueueRepository
  ) {}

  public async execute({
    id,
    name,
    description,
    compliance,
    host,
    port,
    health_value,
    groupId,
  }: IRequest): Promise<Queue> {
    const queue = await this.queueRepository.find(id);
    if (!queue) {
      throw new CustomError("Queue not found", 404);
    }

    queue.name = name || queue.name;
    queue.description = description || "";
    queue.compliance = compliance || "";
    queue.host = host || queue.host;
    queue.port = port || queue.port;
    queue.health_value = health_value || queue.health_value;
    queue.groupId = groupId || queue.groupId;

    await this.queueRepository.save(queue);

    return queue;
  }
}

export default UpdateQueueService;
