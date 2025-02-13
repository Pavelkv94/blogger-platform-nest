import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserJwtPayloadDto } from '../../../features/user-accounts/dto/users/user-jwt-payload.dto';

export const ExtractUserFromRequest = createParamDecorator((data: unknown, context: ExecutionContext): UserJwtPayloadDto => {
  const request = context.switchToHttp().getRequest();

  const user = request.user;

  if (!user) {
    throw new Error('There is no user in the request object!');
  }

  return user;
});

export const ExtractAnyUserFromRequest = createParamDecorator((data: unknown, context: ExecutionContext): UserJwtPayloadDto | null => {
  const request = context.switchToHttp().getRequest();

  const user = request.user;

  return user;
});
