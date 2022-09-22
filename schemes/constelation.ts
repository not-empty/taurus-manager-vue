import { LocalScheme } from '@nuxtjs/auth-next/dist/runtime'

import type {
  HTTPRequest,
  HTTPResponse
} from '@nuxtjs/auth-next'

export default class Constelation extends LocalScheme {
  async login(endpoint: HTTPRequest): Promise<HTTPResponse> { 
      if (this.options.clientId) {
        endpoint.data.client_id = this.options.clientId;
      }
      if (this.options.grantType) {
        endpoint.data.grant_type = this.options.grantType;
      }
      if (this.options.scope) {
        endpoint.data.scope = this.options.scope;
      }
      const response = await this.$auth.request(endpoint, this.options.endpoints.login);
      this.updateTokens(response);
      if (!this.requestHandler.interceptor) {
        this.initializeRequestInterceptor();
      }
      this.$auth.setUser(response.data.user)
      return response;
  }
}