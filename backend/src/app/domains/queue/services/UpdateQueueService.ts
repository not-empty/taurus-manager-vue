import { inject, injectable } from "tsyringe";
import CustomError from "../../../errors/CustomError";
import QueueRepository, { Queue } from "../repositories/QueueRepository";

interface IRequest {
  id: string;
  name?: string;
  description?: string;
  compliance?: string;
  host?: string;
  port?: number;
  healthValue?: number;
  groupId?: string;
}

@injectable()
class UpdateQueueService {
  constructor(
    @inject("QueueRepository")
    private queueRepository: QueueRepository
  ) {}

  public async execute({
    id,
    name,
    description,
    compliance,
    host,
    port,
    healthValue,
    groupId,
  }: IRequest): Promise<Queue> {
    const queue = await this.queueRepository.getById(id);
    if (!queue) {
      throw new CustomError("Queue not found", 404);
    }

    queue.name = name || queue.name;
    queue.description = description || "";
    queue.compliance = compliance || "";
    queue.host = host || queue.host;
    queue.port = port || queue.port;
    queue.healthValue = healthValue || queue.healthValue;
    queue.groupId = groupId || queue.groupId;

    await this.queueRepository.update(id, queue);

    return queue;
  }
}

export default UpdateQueueService;
