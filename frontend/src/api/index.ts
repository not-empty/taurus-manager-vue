import axios, {
  AxiosInstance,
  AxiosResponse,
} from 'axios';

import { EntityModule } from './EntityModule';
import { IUser, IUserAdd, IUserValidate } from 'src/types/user';
import { ILogin } from 'src/types/auth';
import { IGroup } from 'src/types/group';
import { GroupEntityModule } from './EntityGroupModule';
import { IQueue } from 'src/types/queues';
import { QueueEntityModule } from './EntityQueueModule';

import sessionMixin from 'src/mixins/sessionMixin';

export class Api {
  private client: AxiosInstance;

  public user: EntityModule<IUser>;
  public userAdd: EntityModule<IUserAdd>;

  public queue: QueueEntityModule<IQueue>;
  public group: GroupEntityModule<IGroup>;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.VUE_APP_API_URL,
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
        console.log(error);
        if (error.response && error.response.status === 401) {
          sessionMixin().logoff();
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
