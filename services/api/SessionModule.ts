import { ISession } from '../../types/session';
import { Module } from './modules';

interface SessionPayload {
  email: string
  password: string
}

export class SessionModule extends Module {
  public async post (payload: SessionPayload): Promise<ISession> {
    const result = await this.api.$post<ISession>(`/${this.path}`, payload);
    this.api.defaults.headers.common.Authorization = `Bearer ${result.token}`;
    return result;
  }
}
