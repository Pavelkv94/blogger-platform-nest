import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserJwtPayloadDto } from 'src/features/user-accounts/dto/user-jwt-payload.dto';

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
