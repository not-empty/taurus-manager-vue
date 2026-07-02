import Redis from 'ioredis';
import { OmniqClient, QueueMonitor } from 'omniq';
import IQueueProvider, { DescribedQueue } from '../QueueProvider';
import { Queue } from '../../../domains/queue/repositories/QueueRepository';
import {
  Job, JobStacktrace, JobState, QueueJobCounts, QueueStatus,
} from '../types';

type LaneName = 'wait' | 'active' | 'delayed' | 'failed' | 'completed';

interface LaneJob {
  lane: LaneName;
  job_id: string;
  idx_score_ms: number;
  state: string;
  gid: string;
  attempt: number;
  max_attempts: number;
  due_ms: number;
  lock_until_ms: number;
  queued_ms: number;
  first_started_ms: number;
  last_started_ms: number;
  completed_ms: number;
  failed_ms: number;
  updated_ms: number;
  last_error: string;
}

interface JobInfo {
  job_id: string;
  state: string;
  gid: string;
  attempt: number;
  max_attempts: number;
  timeout_ms: number;
  backoff_ms: number;
  lease_token: string;
  lock_until_ms: number;
  due_ms: number;
  payload: string;
  last_error: string;
  last_error_ms: number;
  created_ms: number;
  updated_ms: number;
  queued_ms: number;
  first_started_ms: number;
  last_started_ms: number;
  completed_ms: number;
  failed_ms: number;
}

export class OmniqQueueProvider implements IQueueProvider {
  private redis: Redis;

  private queue: Queue;

  private omniq: OmniqClient;

  private monitor: QueueMonitor;

  constructor(queue: Queue) {
    this.queue = queue;
    this.redis = new Redis({
      host: queue.host,
      port: queue.port,
    });
  }

  async connect() {
    this.omniq = await OmniqClient.create({
      redis: this.redis,
    });

    this.monitor = new QueueMonitor(this.omniq);
  }

  private base() {
    return `{${this.queue.name}}`;
  }

  async addJob(data: any): Promise<boolean> {
    await this.omniq.publish({
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

    await this.omniq.remove_jobs_batch({
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
    const job = await this.monitor.get_job(this.queue.name, jobId);

    if (!job) {
      return undefined;
    }

    return this.jobInfoToJob(job);
  }

  async getJobCounts(): Promise<QueueJobCounts> {
    const stats = await this.monitor.stats(this.queue.name);

    return {
      waiting: !stats.paused ? Number(stats?.waiting_total || '0') : 0,
      paused: stats.paused ? Number(stats?.waiting_total || '0') : 0,
      active: Number(stats?.active || '0'),
      delayed: Number(stats?.delayed || '0'),
      completed: Number(stats?.completed_kept || '0'),
      failed: Number(stats?.failed || '0'),
    };
  }

  async getJobCountsByState(state: JobState): Promise<number> {
    const stats = await this.monitor.stats(this.queue.name);

    switch (state) {
      case 'waiting':
        if (stats.paused) {
          return 0;
        }

        return stats.waiting;

      case 'paused':
        if (!stats.paused) {
          return 0;
        }

        return stats.waiting;

      case 'active':
        return stats.active;

      case 'delayed':
        return stats.delayed;

      case 'failed':
        return stats.failed;

      case 'completed':
        return stats.completed_kept;

      default:
        return 0;
    }
  }

  async getStatus(): Promise<QueueStatus> {
    const stats = await this.monitor.stats(this.queue.name);
    return stats.paused ? 'paused' : 'running';
  }

  async listJobs(state: JobState, start: number, end: number): Promise<Job[]> {
    const queueStatus = await this.getStatus();
    const limit = end - start;

    switch (state) {
      case 'waiting':
      case 'paused': {
        const isPaused = queueStatus !== 'running';

        if (state === 'waiting' && isPaused) return [];
        if (state === 'paused' && !isPaused) return [];

        const result = await this.monitor.lane_page({
          queue: this.queue.name,
          lane: 'wait',
          offset: start,
          limit,
        });

        return result.map((job) => this.mapOmniqToJob(job));
      }

      default: {
        const result = await this.monitor.lane_page({
          queue: this.queue.name,
          lane: state,
          offset: start,
          limit,
        });

        return result.map((job) => this.mapOmniqToJob(job));
      }
    }
  }

  async pause(): Promise<boolean> {
    await this.omniq.pause({ queue: this.queue.name });
    return true;
  }

  async resume(): Promise<boolean> {
    await this.omniq.resume({ queue: this.queue.name });
    return true;
  }

  async retryJobs(jobIds: string[]): Promise<boolean> {
    if (!jobIds.length) return true;

    await this.omniq.retry_failed_batch({
      queue: this.queue.name,
      job_ids: jobIds,
    });

    return true;
  }

  async retryAllJobs(): Promise<boolean> {
    let failedIds: string[] = [];
    let offset = 0;
    const limit = 100;

    do {
      const failed = await this.monitor.lane_page({
        queue: this.queue.name,
        lane: 'failed',
        offset,
        limit,
      });

      failedIds = failed.map((job) => job.job_id);
      if (!failedIds.length) {
        return true;
      }

      offset += limit;

      await this.omniq.retry_failed_batch({
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

  private mapOmniqToJob(job: LaneJob): Job {
    const attempt = Number(job.attempt ?? 0);
    const maxAttempts = Number(job.max_attempts ?? 0);
    const state = this.laneStateToJobState(job.state as LaneName);

    return {
      id: job.job_id,
      name: 'default',
      attemptsMade: attempt,
      timestamp: Number(job.updated_ms ?? Date.now()),
      createdAt: job.queued_ms
        ? new Date(Number(job.queued_ms)).toISOString()
        : undefined,
      processedAt: job.last_started_ms
        ? new Date(Number(job.last_started_ms)).toISOString()
        : undefined,
      finishedAt: job.completed_ms
        ? new Date(Number(job.completed_ms)).toISOString()
        : undefined,
      state,
      canRetry: attempt < maxAttempts,
      failedReason: job.last_error || undefined,
      stacktrace: [],
    };
  }

  private jobInfoToJob(jobInfo: JobInfo): Job {
    const attempt = Number(jobInfo.attempt ?? 0);
    const maxAttempts = Number(jobInfo.max_attempts ?? 0);
    const state = this.laneStateToJobState(jobInfo.state as LaneName);
    const payload = jobInfo.payload ? JSON.parse(jobInfo.payload) : undefined;

    return {
      id: jobInfo.job_id,
      name: 'default',
      data: payload,
      attemptsMade: attempt,
      timestamp: Number(jobInfo.updated_ms ?? Date.now()),
      createdAt: jobInfo.queued_ms
        ? new Date(Number(jobInfo.queued_ms)).toISOString()
        : undefined,
      processedAt: jobInfo.last_started_ms
        ? new Date(Number(jobInfo.last_started_ms)).toISOString()
        : undefined,
      finishedAt: jobInfo.completed_ms
        ? new Date(Number(jobInfo.completed_ms)).toISOString()
        : undefined,
      state,
      canRetry: attempt < maxAttempts,
      failedReason: jobInfo.last_error || undefined,
      stacktrace: [],
    };
  }

  private laneStateToJobState(state: LaneName): JobState {
    if (state === 'wait') {
      return 'paused';
    }

    return state;
  }
}

export default OmniqQueueProvider;
