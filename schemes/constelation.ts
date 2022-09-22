// import { HTTPRequest, HTTPResponse, LocalScheme } from '@nuxtjs/auth'

// export default class Constelation extends LocalScheme {
//   async login(endpoint: HTTPRequest, { reset }: {reset?: boolean;}): Promise<HTTPResponse> {
//       if (reset) {
//         this.$auth.reset({ resetInterceptor: false });
//       }
//       if (this.options.clientId) {
//         endpoint.data.client_id = this.options.clientId;
//       }
//       if (this.options.grantType) {
//         endpoint.data.grant_type = this.options.grantType;
//       }
//       if (this.options.scope) {
//         endpoint.data.scope = this.options.scope;
//       }
//       const response = await this.$auth.request(endpoint, this.options.endpoints.login);
//       this.updateTokens(response);
//       if (!this.requestHandler.interceptor) {
//         this.initializeRequestInterceptor();
//       }
//       // this.$auth.setUser(response.data.user)
//       return response;
//   }
// }