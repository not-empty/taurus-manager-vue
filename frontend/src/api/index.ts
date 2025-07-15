import axios from 'axios';
import router from '@/router';

import type {
  AxiosInstance,
  AxiosResponse,
} from 'axios';

import type { IUser, IUserAdd, IUserValidate } from '@/types/user';
import type { ILogin } from '@/types/auth';
import type { IGroup } from '@/types/group';
import type { IQueue } from '@/types/queues';

import { GroupEntityModule } from './EntityGroupModule';
import { QueueEntityModule } from './EntityQueueModule';
import { EntityModule } from './EntityModule';
import { API_URL } from '@/config/api';

export class Api {
  private client: AxiosInstance;

  public user: EntityModule<IUser>;
  public userAdd: EntityModule<IUserAdd>;

  public queue: QueueEntityModule<IQueue>;
  public group: GroupEntityModule<IGroup>;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.interceptors();

    // modules
    this.user = this.getEntity('user');
    this.userAdd = this.getEntity('user');

    this.queue = this.getEntityQueue('queue');
    this.group = this.getEntityGroup('group');
  }

  private getEntity<T>(path: string): EntityModule<T> {
    return new EntityModule<T>({ path, api: this.client });
  }

  private getEntityQueue<T>(path: string): QueueEntityModule<T> {
    return new QueueEntityModule<T>({ path, api: this.client });
  }

  private getEntityGroup<T>(path: string): GroupEntityModule<T> {
    return new GroupEntityModule<T>({ path, api: this.client });
  }

  private interceptors() {
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          router.push('/logout');
          return;
        }

        return Promise.reject(error);
      }
    );
  }

  public async loginAuth(
    login: string,
    password: string,
  ): Promise<boolean> {
    try {
      const response = await this.client.post<
        ILogin,
        AxiosResponse<ILogin>
      >('session', {
        login,
        password,
      });

      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  public async validate(): Promise<IUserValidate> {
    const response = await this.client.post<IUserValidate>('user/validate', {});
    return response.data;
  }
}
