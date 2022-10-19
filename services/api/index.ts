import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { EntityModule } from './EntityModule';
import { SessionModule } from './SessionModule';
import { IUser } from '../../types/user';
import { IGroup } from '../../types/group';
import { QueueModule } from "./QueueModule";
import { DashModule } from "./DashModule";
import { JobsModule } from "./JobsModule";
import { GroupModule } from "./GroupModule";

export class Api{
  private client: NuxtAxiosInstance;
  public token: string | null;
  public user: EntityModule<IUser>;
  public group: GroupModule;
  public queue: QueueModule;
  public session: SessionModule;
  public dashboard: DashModule;
  public jobs: JobsModule;

  constructor($axios: NuxtAxiosInstance) {
    this.client = $axios
    this.token = null;
    this.user = this.getEntity('user');
    this.group = this.getGroups();
    this.queue = this.getQueues();
    this.dashboard = this.getDash();
    this.session = this.getSession();
    this.jobs = this.getJobs();
  }

  private getEntity<T>(path: string): EntityModule<T> {
    return new EntityModule<T>(this.client, path);
  }

  private getSession(): SessionModule {
    return new SessionModule(this.client, 'session')
  }

  private getQueues(): QueueModule {
    return new QueueModule(this.client, 'queue')
  }

  private getDash(): DashModule {
    return new DashModule(this.client)
  }

  private getJobs(): JobsModule {
    return new JobsModule(this.client, 'queue')
  }

  private getGroups(): GroupModule {
    return new GroupModule(this.client, 'group')
  }
}