import { NuxtAxiosInstance } from "@nuxtjs/axios";

export class Module {
  public api: NuxtAxiosInstance;
  public path: string

  constructor(axios: NuxtAxiosInstance, path: string) {
    this.api = axios;
    this.path = path;
  }
}