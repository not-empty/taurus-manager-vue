import { Module } from './modules';
import {
  ApiListResponse,
  ApiResponsePaginated
} from './types';
import { IJob } from '~/types/job';

interface payloadCreateJob {
  data: any;
}

interface payloadCreateJobRetryJob {
  jobIds: string[];
  state: string;
}


export class DashModule extends Module {

  public async createJob(id: string, payload: payloadCreateJob): Promise<boolean> {
    const result = await this.api.$post<ApiListResponse<boolean>>(`${this.path}/${id}/job`, payload);

    return result.data;
  }

  public async cloneJob(queueId: string, jobId: string): Promise<boolean> {
    const result = await this.api.$post<ApiListResponse<boolean>>(`${this.path}/${queueId}/job/${jobId}/clone`);

    return result.data;
  }

  public async retryJob(queueId: string, payload: payloadCreateJobRetryJob): Promise<boolean> {
    const result = await this.api.$post<ApiListResponse<boolean>>(`${this.path}/${queueId}/job/retry`, payload);

    return result.data;
  }

  public async retryAllJob(queueId: string): Promise<boolean> {
    const result = await this.api.$post<ApiListResponse<boolean>>(`${this.path}/${queueId}/job/retry-all`);

    return result.data;
  }

  public async getJob(queueId: string, jobId: string): Promise<IJob> {
    const result = await this.api.$get<ApiListResponse<IJob>>(`${this.path}/${queueId}/job/${jobId}`);

    return result.data;
  }

  public async getJobPaginate(queueId: string, page: number, size: number, state: string) {
    const result = await this.api.$get<ApiResponsePaginated<IJob>>(`${this.path}/${queueId}/job?state=${state}&page=${page}&size=${size}`);

    return result.data;
  }

  public async exportJob(queueId: string, jobId: string): Promise<IJob> {
    const result = await this.api.$get<ApiListResponse<IJob>>(`${this.path}/${queueId}/job/${jobId}/export`);

    return result.data;
  }

  public async deleteJob(queueId: string, jobsIds: Omit<payloadCreateJobRetryJob, "state">) {
    const result = await this.api.$delete<ApiListResponse<boolean>>(`${this.path}/${queueId}/job`, { data:jobsIds });

    return result.data;
  }
}
