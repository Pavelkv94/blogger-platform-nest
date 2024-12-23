import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshAuthPassportGuard extends AuthGuard('jwt-refresh') {}
