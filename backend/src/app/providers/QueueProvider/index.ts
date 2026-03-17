import { Queue } from '../../domains/queue/repositories/QueueRepository';
import BullQueueProvider from './providers/BullQueueProvider';
import OmniqQueueProvider from './providers/OmniqQueueProvider';
import IQueueProvider from './QueueProvider';

type QueueEngine = 'bull' | 'omniq';

const queueProviderRegistry: Record<QueueEngine, (queue: Queue) => IQueueProvider> = {
  omniq: (queue) => new OmniqQueueProvider(queue),
  bull: (queue) => new BullQueueProvider(queue),
};

export default function getQueueProvider(queue: Queue): IQueueProvider {
  const factory = queueProviderRegistry[queue.engine as QueueEngine];

  if (!factory) {
    throw new Error(`Unsupported queue engine: ${queue.engine}`);
  }

  return factory(queue);
}
