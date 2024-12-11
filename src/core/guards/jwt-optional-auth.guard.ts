import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

//в домашнем задании есть случай когда надо проверить токен и извлечь данные из токена, но не блокировать запрос для анонимного пользователя
//для этого можно использовать подобный гард, переопределив handleRequest
//https://docs.nestjs.com/recipes/passport#extending-guards
@Injectable()
export class JwtOptionalAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  //handleRequest(err: any, user: any, info: any) {}
}
