// Authentication Models

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface SignOutRequest {
  sessionId: string;
  userId?: string;
}

export interface UserInfo {
  userid: string;
  companyid: string;
  email: string;
  fullname: string;
  role: string;
  phonenumber?: string;
  exp: number;
  iat: number;
  nbf: number;
  iss: string;
}

export interface DecodedToken {
  [key: string]: any;
}
