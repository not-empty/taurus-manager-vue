import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { EntityModule } from './EntityModule';
import { IUser } from '../../types/user';
import { IGroup } from '../../types/group';
import { IQueue } from '../../types/queue';

export class Api{
  private client: NuxtAxiosInstance
  public token: string | null;
  public user: EntityModule<IUser>;
  public group: EntityModule<IGroup>
  public queue: EntityModule<IQueue>

  constructor($axios: NuxtAxiosInstance) {
    this.client = $axios
    this.token = null;
    this.user = this.getEntity('user');
    this.group = this.getEntity('group');
    this.queue = this.getEntity('queue');
  }

  private getEntity<T>(path: string): EntityModule<T> {
    return new EntityModule<T>(this.client, path);
  }
}