export interface DeviceInfoUser {
  email: string;
  password: string;
}

interface UserTokenPayload {
  roles: string[];
  permissions: string[];
  access_token: string;
}

export interface User {
  name: string;
  tel: string;
  token_payload: UserTokenPayload;
  access_token: string;
}
