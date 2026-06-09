export interface AccessTokenPayload {
  sub: string;
  role: string[];
  jti: string;
  iat?: number;
  exp?: number;
}
