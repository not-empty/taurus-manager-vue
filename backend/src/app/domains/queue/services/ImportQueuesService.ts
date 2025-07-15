import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import QueueRepository, { Queue } from '../repositories/QueueRepository';
import GroupRepository, { Group } from '../../group/repositories/GroupRepository';
import ScanQueueProvider from '../../../providers/ScanQueueProvider/ScanQueueProvider';
import { BaseEntity, FilterTypes } from '../../../core/BaseRepository';
import IHashProvider from '../../user/providers/HashProvider/models/IHashProvider';
import UserRepository from '../../user/repositories/UserRepository';

type AddQueue = Omit<Queue, keyof BaseEntity>;

interface IRequest {
  host: string;
  port: number;
  groupId: string;
  userId: string;
  password: string;
  healthValue?: number;
}

@injectable()
class ImportQueuesService {
  constructor(
    @inject('QueueRepository')
    private queueRepository: QueueRepository,
    @inject('GroupRepository')
    private groupRepository: GroupRepository,
    @inject('UserRepository')
    private userRepository: UserRepository,
    @inject('HashProvider')
    private hashProvider: IHashProvider,
  ) {
    //
  }

  public async execute({
    host,
    port,
    userId,
    password,
    groupId,
    healthValue = 100,
  }: IRequest): Promise<Queue[]> {
    const user = await this.userRepository.getById(userId);

    if (!user) {
      throw new CustomError('Incorrect Authentication', 403);
    }

    const passwordCompare = await this.hashProvider.compare(
      password,
      user.password,
    );

    if (!passwordCompare) {
      throw new CustomError('Incorrect Authentication', 403);
    }

    let group: Group | null = null;
    if (groupId) {
      group = await this.groupRepository.getById(groupId);

      if (!group) {
        throw new CustomError('Group not found', 404);
      }
    }

    const scanQueueProvider = new ScanQueueProvider({
      host,
      port,
    });

    try {
      const prefixes = await scanQueueProvider.scanQueues();
      const newPrefixes = await this.checkPrefixes(prefixes);

      if (!newPrefixes.length) {
        return [];
      }

      const queuesPayload: AddQueue[] = newPrefixes.map<AddQueue>((prefix) => ({
        groupId,
        healthValue,
        host,
        name: prefix,
        port,
      }));

      const queueIds = await this.queueRepository.bulkInsert(queuesPayload);
      const queues = await this.queueRepository.getBulk(queueIds);

      return queues;
    } catch (err) {
      await scanQueueProvider.close();
      throw err;
    }
  }

  async checkPrefixes(prefixes: string[]): Promise<string[]> {
    const newPrefixes: string[] = [];
    for (const prefix of prefixes) {
      const queues = await this.queueRepository.list({
        limit: 1,
        filters: [{ field: 'name', type: FilterTypes.FILTER_EQUAL, value: prefix }],
      });
      if (!queues.data.length) {
        newPrefixes.push(prefix);
      }
    }
    return newPrefixes;
  }
}

export default ImportQueuesService;
