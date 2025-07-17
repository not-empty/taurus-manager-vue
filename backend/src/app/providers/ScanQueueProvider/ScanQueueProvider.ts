import Redis from 'ioredis';

interface ScanQueueProviderOptions {
  host: string;
  port: number;
}

export class ScanQueueProvider {
  private redis: Redis;

  constructor({ host, port }: ScanQueueProviderOptions) {
    this.redis = new Redis({
      host,
      port,
      lazyConnect: true,
      connectTimeout: 5000,
      maxRetriesPerRequest: 0,
    });

    this.redis.on('error', (err) => console.error('Redis Client Error:', err));
  }

  async scanPrefixes(pattern: string): Promise<string[]> {
    let cursor = '0';
    const prefixes = new Set<string>();

    do {
      const [newCursor, elements] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = newCursor;
      elements.forEach((key: string) => {
        const match = key.match(/bull:(.*?):/);
        if (match && match[1]) {
          prefixes.add(match[1]);
        }
      });
    } while (Number(cursor) !== 0);

    return Array.from(prefixes);
  }

  async scanQueues(): Promise<string[]> {
    return this.scanPrefixes('bull:*');
  }

  async close() {
    await this.redis.quit();
  }
}

export default ScanQueueProvider;
