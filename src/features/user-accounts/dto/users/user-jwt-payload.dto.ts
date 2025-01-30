/**
 * user object for jwt token and for throw from request object
 */
export class UserJwtPayloadDto {
  userId: string;
  deviceId: string;
  iat: number;
  exp: number;
}
