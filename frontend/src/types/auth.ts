export interface IAuth {
  data: {
    token: string;
    valid_until: string;
  };
  profiler: number;
  requestId: string;
}

export interface ILoginArgs {
  email: string;
  password: string;
}

export interface ILogin {
  success: boolean;
}

export interface ILoginError {
  data: [];
  profiler: number;
  token: null;
  requestId: string;
  message: string;
}

export interface JwtSub {
  subject: string;
  Suffix: string;
  Context: string;
  role: string;
  scs_ids: object;
  name: string;
  email: string;
}

export interface JwtData {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  sub: JwtSub;
}

export interface JwtUserData {
  role: string;
  scs_ids: object;
  name: string;
}
