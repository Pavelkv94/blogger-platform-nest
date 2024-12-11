import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

//этот гард вешаем на логин. Через локальную стратегию проверяются логин и пароль пользователя
@Injectable()
export class LocalAuthPasportGuard extends AuthGuard('local') {}
