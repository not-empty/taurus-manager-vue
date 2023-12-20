import { container } from 'tsyringe';

import '../domains/user/providers';

import IGroupRepository from '../domains/group/repositories/models/IGroupRepository';
import GroupRepository from '../domains/group/repositories/GroupRepository';

import IQueueRepository from '../domains/queue/repositories/models/IQueueRepository';
import QueueRepository from '../domains/queue/repositories/QueueRepository';

import IUserRepository from '../domains/user/repositories/models/IUserRepository';
import UserRepository from '../domains/user/repositories/UserRepository';

container.registerSingleton<IGroupRepository>(
  'GroupRepository',
  GroupRepository,
);

container.registerSingleton<IQueueRepository>(
  'QueueRepository',
  QueueRepository,
);

container.registerSingleton<IUserRepository>(
  'UserRepository',
  UserRepository,
);
