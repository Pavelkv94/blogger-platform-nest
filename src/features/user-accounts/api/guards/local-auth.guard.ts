import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UnauthorizedDomainException } from 'src/core/exeptions/domain-exceptions';
import { AuthService } from '../../application/auth.service';
import { LoginInputDto } from '../../dto/login-user.dto';

@Injectable()
export class LocalAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request<object, object, LoginInputDto>>();

    const user = await this.authService.validateUser(request.body);

    
    if (!user) {
      throw UnauthorizedDomainException.create();
    }

    request['user'] = { userId: user.id };

    return true;
  }
}
