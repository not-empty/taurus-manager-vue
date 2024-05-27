import { IJob, IJobState } from 'src/types/job';
import { EntityModule } from './EntityModule';
import { ApiAddResponse, ApiDetailResponse, ApiListResponse, PaginationPayload, PaginationResult } from './types';
import { prepareQuery } from './query';
import { INewQueue, IQueue, IQueueDash } from 'src/types/queues';

interface dataChangeQueueStatus {
  ids: string[];
}

interface dataRetryJobs {
  jobIds: string[];
}

interface JobPaginationPayload extends PaginationPayload {
  state: IJobState,
}

export class QueueEntityModule<T> extends EntityModule<T> {
  public async queueAdd(payload: INewQueue): Promise<IQueue> {
    const result = await this.api.post<ApiAddResponse<IQueue>>(
      `/${this.path}`,
      payload,
    );

    return result.data;
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
}
