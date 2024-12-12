import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UnauthorizedDomainException } from 'src/core/exeptions/domain-exceptions';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw UnauthorizedDomainException.create();
    }

    const [authType, token] = authHeader.split(' ');

    if (authType !== 'Bearer') {
      throw UnauthorizedDomainException.create();
    }

    //try catch for token expiration errors and other JWT verification errors
    try {
      const payload = this.jwtService.verify(token);
      request['user'] = payload;
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: any) {
      throw UnauthorizedDomainException.create();
    }
  }
}
