import { Module } from './modules';
import {
  ApiResponseJobsPaginated
} from './types';
import { IJob } from '~/types/job';

interface payloadCreateJob {
  data: any;
}

interface payloadCreateJobRetryJob {
  jobIds: string[];
  state: string;
}


export class JobsModule extends Module {

  public async createJob(id: string, payload: payloadCreateJob): Promise<boolean> {
    const result = await this.api.$post<boolean>(`${this.path}/${id}/job`, payload);

    return result;
  }

  public async cloneJob(queueId: string, jobId: string): Promise<boolean> {
    const result = await this.api.$post<boolean>(`${this.path}/${queueId}/job/${jobId}/clone`);

    return result;
  }

  public async retryJob(queueId: string, payload: payloadCreateJobRetryJob): Promise<boolean> {
    const result = await this.api.$post<boolean>(`${this.path}/${queueId}/job/retry`, payload);

    return result;
  }

  public async retryAllJob(queueId: string): Promise<boolean> {
    const result = await this.api.$post<boolean>(`${this.path}/${queueId}/job/retry-all`);

    return result;
  }

  public async getJob(queueId: string, jobId: string): Promise<IJob> {
    const result = await this.api.$get<IJob>(`${this.path}/${queueId}/job/${jobId}`);

    return result;
  }

  public async getJobPaginate(queueId: string, page: number, size: number, state: string): Promise<ApiResponseJobsPaginated<IJob[]>> {
    const result = await this.api.$get<ApiResponseJobsPaginated<IJob[]>>(`${this.path}/${queueId}/job?state=${state}&page=${page}&size=${size}`);

    return result;
  }

  public async exportJob(queueId: string, jobId: string): Promise<IJob> {
    const result = await this.api.$get<IJob>(`${this.path}/${queueId}/job/${jobId}/export`);

    return result;
  }

  public async deleteJob(queueId: string, jobsIds: Omit<payloadCreateJobRetryJob, "state">): Promise<boolean> {
    const result = await this.api.$delete<boolean>(`${this.path}/${queueId}/job`, { data:jobsIds });

    return result;
  }
}
