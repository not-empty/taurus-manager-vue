import { container } from 'tsyringe';

import '../domains/user/providers';

import GroupRepository from '../domains/group/repositories/GroupRepository';

import QueueRepository from '../domains/queue/repositories/QueueRepository';

import UserRepository from '../domains/user/repositories/UserRepository';

container.registerSingleton<GroupRepository>(
  'GroupRepository',
  GroupRepository,
);

container.registerSingleton<QueueRepository>(
  'QueueRepository',
  QueueRepository,
);

container.registerSingleton<UserRepository>(
  'UserRepository',
  UserRepository,
);
