import Redis from 'ioredis';
import { OmniqClient } from 'omniq';
import IQueueProvider, { DescribedQueue } from '../QueueProvider';
import { Queue } from '../../../domains/queue/repositories/QueueRepository';
import {
  Job, JobStacktrace, JobState, QueueJobCounts, QueueStatus,
} from '../types';

export class OmniqQueueProvider implements IQueueProvider {
  private redis: Redis;

  private queue: Queue;

  constructor(queue: Queue) {
    this.queue = queue;
    this.redis = new Redis({
      host: queue.host,
      port: queue.port,
    });
  }

  private base() {
    return `{${this.queue.name}}`;
  }

  async addJob(data: any): Promise<boolean> {
    const omniq = await OmniqClient.create({
      redis: this.redis,
    });

    await omniq.publish({
      queue: this.queue.name,
      payload: data,
    });

    return true;
  }

  async cloneJob(jobId: string): Promise<boolean> {
    const job = await this.getJob(jobId);
    if (!job) return false;

    return this.addJob(job.data);
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }

  async deleteJobs(jobIds: string[]): Promise<boolean> {
    if (!jobIds.length) return true;

    const job = await this.getJob(jobIds[0]);
    if (!job) {
      return true;
    }

    const omniq = await OmniqClient.create({
      redis: this.redis,
    });

    await omniq.remove_jobs_batch({
      queue: this.queue.name,
      job_ids: jobIds,
      lane: job.state,
    });

    return true;
  }

  async describe(): Promise<DescribedQueue> {
    const jobCounts = await this.getJobCounts();
    const status = await this.getStatus();

    return {
      ...this.queue,
      jobCounts,
      status,
    };
  }

  async exportJob(jobId: string): Promise<string | null> {
    const data = await this.redis.hgetall(`${this.base()}:job:${jobId}`);
    if (!data || Object.keys(data).length === 0) return null;

    return JSON.stringify(data);
  }

  async getJob(jobId: string): Promise<Job | undefined> {
    const data = await this.redis.hgetall(`${this.base()}:job:${jobId}`);
    if (!data || Object.keys(data).length === 0) return undefined;

    return this.mapOmniqToJob(jobId, data);
  }

  async getJobCounts(): Promise<QueueJobCounts> {
    const base = this.base();

    const [waiting, active, delayed, completed, failed] = await Promise.all([
      this.redis.llen(`${base}:wait`),
      this.redis.zcard(`${base}:active`),
      this.redis.zcard(`${base}:delayed`),
      this.redis.llen(`${base}:completed`),
      this.redis.llen(`${base}:failed`),
    ]);

    const queueStatus = await this.getStatus();

    return {
      waiting: queueStatus === 'running' ? waiting : 0,
      paused: queueStatus === 'paused' ? waiting : 0,
      active,
      delayed,
      completed,
      failed,
    };
  }

  async getJobCountsByState(state: JobState): Promise<number> {
    const base = this.base();
    const queueStatus = await this.getStatus();

    switch (state) {
      case 'waiting':
        if (queueStatus === 'paused') {
          return 0;
        }

        return this.redis.llen(`${base}:wait`);

      case 'paused':
        if (queueStatus === 'running') {
          return 0;
        }

        return this.redis.llen(`${base}:wait`);

      case 'active':
        return this.redis.zcard(`${base}:active`);

      case 'delayed':
        return this.redis.zcard(`${base}:delayed`);

      case 'failed':
        return this.redis.llen(`${base}:failed`);

      case 'completed':
        return this.redis.llen(`${base}:completed`);

      default:
        return 0;
    }
  }

  async getStatus(): Promise<QueueStatus> {
    const paused = await this.redis.exists(`${this.base()}:paused`);
    return paused === 1 ? 'paused' : 'running';
  }

  async listJobs(state: JobState, start: number, end: number): Promise<Job[]> {
    const base = this.base();
    const queueStatus = await this.getStatus();

    let ids: string[] = [];

    switch (state) {
      case 'waiting':
        if (queueStatus === 'paused') {
          return [];
        }

        ids = await this.redis.lrange(`${base}:wait`, start, end);
        break;

      case 'paused':
        if (queueStatus === 'running') {
          return [];
        }

        ids = await this.redis.lrange(`${base}:wait`, start, end);
        break;

      case 'active':
        ids = await this.redis.zrange(`${base}:active`, start, end);
        break;

      case 'delayed':
        ids = await this.redis.zrange(`${base}:delayed`, start, end);
        break;

      case 'failed':
        ids = await this.redis.lrange(`${base}:failed`, start, end);
        break;

      case 'completed':
        ids = await this.redis.lrange(`${base}:completed`, start, end);
        break;

      default:
        return [];
    }

    if (!ids.length) return [];

    const pipeline = this.redis.pipeline();

    ids.forEach((id) => {
      pipeline.hgetall(`${base}:job:${id}`);
    });

    const results = await pipeline.exec();
    if (!results) return [];

    return results
      .map((r, i) => {
        const data = r[1] as any;
        if (!data || Object.keys(data).length === 0) return null;

        return this.mapOmniqToJob(ids[i], data);
      })
      .filter(Boolean) as Job[];
  }

  async pause(): Promise<boolean> {
    await this.redis.set(`${this.base()}:paused`, '1');
    return true;
  }

  async resume(): Promise<boolean> {
    await this.redis.del(`${this.base()}:paused`);
    return true;
  }

  async retryJobs(jobIds: string[]): Promise<boolean> {
    if (!jobIds.length) return true;

    const omniq = await OmniqClient.create({
      redis: this.redis,
    });

    await omniq.retry_failed_batch({
      queue: this.queue.name,
      job_ids: jobIds,
    });

    return true;
  }

  async retryAllJobs(): Promise<boolean> {
    const base = this.base();

    const omniq = await OmniqClient.create({
      redis: this.redis,
    });

    let failedIds: string[] = [];
    let offset = 0;
    const limit = 100;

    do {
      failedIds = await this.redis.lrange(`${base}:failed`, offset, offset + limit);
      if (!failedIds.length) {
        return true;
      }

      offset += limit;

      await omniq.retry_failed_batch({
        queue: this.queue.name,
        job_ids: failedIds,
      });
    } while (failedIds.length < 100);

    return true;
  }

  public formatJobStacktrace(stacktrace?: string[]): JobStacktrace[] | null {
    if (!stacktrace) {
      return null;
    }

    return stacktrace.map((item, index) => ({
      order: index,
      content: item,
    }));
  }

  private mapOmniqToJob(id: string, data: any): Job {
    const payload = data.payload ? JSON.parse(data.payload) : undefined;

    const attempt = Number(data.attempt ?? 0);
    const maxAttempts = Number(data.max_attempts ?? 0);

    return {
      id,
      name: payload?.name ?? 'default',
      data: payload,
      attemptsMade: attempt,
      timestamp: Number(data.updated_ms ?? Date.now()),
      createdAt: data.created_at
        ? new Date(Number(data.created_at)).toISOString()
        : undefined,
      processedAt: data.processed_at
        ? new Date(Number(data.processed_at)).toISOString()
        : undefined,
      finishedAt: data.finished_at
        ? new Date(Number(data.finished_at)).toISOString()
        : undefined,
      state: data.state,
      canRetry: attempt < maxAttempts,
      failedReason: data.last_error || undefined,
      stacktrace: [],
    };
  }
}

export default OmniqQueueProvider;
