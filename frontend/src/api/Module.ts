import type { AxiosInstance } from 'axios';

export interface ModuleConstructor {
  path: string;
  api: AxiosInstance;
}

export class Module {
  public path: string;
  public api: AxiosInstance;

  constructor(payload: ModuleConstructor) {
    this.api = payload.api;
    this.path = payload.path;
  }
}
