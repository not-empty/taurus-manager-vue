import type { IJob, IJobState } from '@/types/job';
import type { INewQueue, IQueue, IQueueBatchEdit, IQueueDash } from '@/types/queues';
import type { ApiAddResponse, ApiDetailResponse, ApiListResponse, PaginationPayload, PaginationResult } from './types';
import { EntityModule } from './EntityModule';
import { prepareQuery } from './query';

interface dataChangeQueueStatus {
  ids: string[];
}

interface dataRetryJobs {
  jobIds: string[];
}

interface JobPaginationPayload extends PaginationPayload<IJob> {
  state: IJobState,
}

interface ImportQueuesPayload {
  host: string;
  port: number;
  groupId: string;
  password: string;
  healthValue?: number;
}

export class QueueEntityModule<T> extends EntityModule<T> {
  public async queueAdd(payload: INewQueue): Promise<IQueue> {
    const result = await this.api.post<ApiAddResponse<IQueue>>(
      `/${this.path}`,
      payload,
    );

    return result.data;
  }

  public async importQueues(payload: ImportQueuesPayload): Promise<IQueue[]> {
    const response = await this.api.post<IQueue[]>(
      `/${this.path}/import`,
      payload,
    );

    return response.data;
  }

  public async getQueueDashboard(queueId: string): Promise<IQueueDash> {
    const result = await this.api.get<IQueueDash>(
      `/${this.path}/${queueId}/dashboard`,
    );

    return result.data;
  }

  public async chageQueueStatus(
    action: 'resume' | 'pause',
    data: dataChangeQueueStatus
  ): Promise<boolean> {
    const result = await this.api.put<boolean>(
      `/${this.path}/${action}`,
      data
    );

    return result.data;
  }

  public async getJobById(
    queueId: string,
    jobId: string
  ): Promise<IJob> {
    const result = await this.api.get<ApiDetailResponse<IJob>>(
      `/${this.path}/${queueId}/job/${jobId}`,
    );

    return result.data;
  }

  public async getJobPaginated(
    queueId: string,
    payload: JobPaginationPayload = {
      page: 1,
      size: 25,
      state: 'active',
    },
  ): Promise<PaginationResult<IJob>> {
    const query = prepareQuery(payload);
    const result = await this.api.get<ApiListResponse<IJob>>(
      `/${this.path}/${queueId}/job?${query}&state=${payload.state}`,
    );

    const total = result.data.total;
    const totalPages = total / payload.size;

    return {
      data: result.data.data,
      pagination: {
        ...payload,
        totalPages,
        total,
      }
    };
  }

  public async createJob(
    queueId: string,
    data: {
      data: unknown;
    }
  ): Promise<boolean> {
    const result = await this.api.post<boolean>(
      `/${this.path}/${queueId}/job`,
      data
    );

    return result.data;
  }

  public async cloneJob(
    queueId: string,
    jobId: string,
  ): Promise<boolean> {
    const result = await this.api.post<boolean>(
      `/${this.path}/${queueId}/job/${jobId}/clone`,
      {}
    );

    return result.data;
  }

  public async deleteJob(
    queueId: string,
    data: {
      jobIds: string[];
    }
  ): Promise<boolean> {
    const result = await this.api.delete<boolean>(
      `/${this.path}/${queueId}/job`,
      { data }
    );

    return result.data;
  }

  public async retryAction(
    queueId: string,
    data: dataRetryJobs
  ): Promise<boolean> {
    const result = await this.api.post<boolean>(
      `/${this.path}/${queueId}/job/retry`,
      data
    );

    return result.data;
  }

  public async retryAllAction(queueId: string): Promise<boolean> {
    const result = await this.api.post<boolean>(
      `/${this.path}/${queueId}/job/retry-all`,
      {}
    );

    return result.data;
  }

  public async batchUpdate(ids: string[], data: IQueueBatchEdit) : Promise<IQueue[]> {
    const result = await this.api.post<IQueue[]>(
      `/${this.path}/batch`,
      {
        ids,
        data,
      },
    );

    return result.data;
  }
}
