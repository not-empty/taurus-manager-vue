import type { NuxtAxiosInstance } from '@nuxtjs/axios';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import { UserModule } from './UserModule';
import { SessionModule } from './SessionModule';
import { QueueModule } from './QueueModule';
import { DashModule } from './DashModule';
import { JobsModule } from './JobsModule';
import { GroupModule } from './GroupModule';

export class Api {
  public client: NuxtAxiosInstance;
  public token: string | null;
  public user: UserModule;
  public group: GroupModule;
  public queue: QueueModule;
  public session: SessionModule;
  public dashboard: DashModule;
  public jobs: JobsModule;

  constructor ($axios: NuxtAxiosInstance) {
    this.client = $axios;
    this.token = null;
    this.user = this.getUser();
    this.group = this.getGroups();
    this.queue = this.getQueues();
    this.dashboard = this.getDash();
    this.session = this.getSession();
    this.jobs = this.getJobs();
  }

  private getUser (): UserModule {
    return new UserModule(this.client, 'user');
  }

  private getSession (): SessionModule {
    return new SessionModule(this.client, 'session');
  }

  private getQueues (): QueueModule {
    return new QueueModule(this.client, 'queue');
  }

  private getDash (): DashModule {
    return new DashModule(this.client);
  }

  private getJobs (): JobsModule {
    return new JobsModule(this.client, 'queue');
  }

  private getGroups (): GroupModule {
    return new GroupModule(this.client, 'group');
  }

  public setInterceptorResponseError (
    interceptor: (error: AxiosError) => Promise<AxiosError>
  ) {
    this.client.interceptors.response.use(
      response => response,
      interceptor
    );
  }

  public setInterceptorRequest (
    interceptor: (config: AxiosRequestConfig) => AxiosRequestConfig
  ) {
    this.client.interceptors.request.use(interceptor);
  }
}
