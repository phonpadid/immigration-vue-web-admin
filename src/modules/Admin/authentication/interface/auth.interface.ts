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
export interface Profile {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  image: string | null;
}

export interface Users {
  id: number;
  hotel_id: number | null;
  email: string;
  profile: Profile;
}
