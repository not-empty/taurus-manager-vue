import { Module } from './modules';
import { ISession } from '../../types/session'
import {
  ApiSessionResponse,
} from './types';

interface SessionPayload {
  email: string
  password: string
}

export class SessionModule extends Module {
  public async post(payload: SessionPayload): Promise<ISession> {
    const result = await this.api.$post<ApiSessionResponse>(`/${this.path}`, payload);

    return result.data;
  }
}