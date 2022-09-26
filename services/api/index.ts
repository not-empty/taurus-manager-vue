import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { EntityModule } from './EntityModule';
import { SessionModule } from './SessionModule';
import { IUser } from '../../types/user';
import { IGroup } from '../../types/group';
import { IQueue } from '../../types/queue';

export class Api{
  private client: NuxtAxiosInstance
  public token: string | null;
  public user: EntityModule<IUser>;
  public group: EntityModule<IGroup>
  public queue: EntityModule<IQueue>
  public session: SessionModule

  constructor($axios: NuxtAxiosInstance) {
    this.client = $axios
    this.token = null;
    this.user = this.getEntity('user');
    this.group = this.getEntity('group/dashboard');
    this.queue = this.getEntity('queue');
    this.session = this.getSession();
  }

  private getEntity<T>(path: string): EntityModule<T> {
    return new EntityModule<T>(this.client, path);
  }

  private getSession(): SessionModule {
    return new SessionModule(this.client, 'session')
  }
}