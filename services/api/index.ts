import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { EntityModule } from './EntityModule';
import { SessionModule } from './SessionModule';
import { IUser } from '../../types/user';
import { IGroup } from '../../types/group';
import { QueueModule } from "./QueueModule";
import { DashModule } from "./DashModule";

export class Api{
  private client: NuxtAxiosInstance
  public token: string | null;
  public user: EntityModule<IUser>;
  public group: EntityModule<IGroup>
  public queue: QueueModule
  public session: SessionModule
  public dashboard: DashModule

  constructor($axios: NuxtAxiosInstance) {
    this.client = $axios
    this.token = null;
    this.user = this.getEntity('user');
    this.group = this.getEntity('group');
    this.queue = this.getQueues();
    this.dashboard = this.getDash();
    this.session = this.getSession();
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
}