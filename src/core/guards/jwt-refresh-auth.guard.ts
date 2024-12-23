//* замена passport.js
//? example
// import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// import { Request } from 'express';
// import { UnauthorizedDomainException } from 'src/core/exeptions/domain-exceptions';
// import { JwtService } from '@nestjs/jwt';

// @Injectable()
// export class JwtAuthRefreshGuard implements CanActivate {
//   constructor(private readonly jwtService: JwtService) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest<Request>();
//     const refreshToken = request.cookies.refreshToken;
//     console.log("from refresh ",refreshToken);

//     if (!refreshToken) {
//       throw UnauthorizedDomainException.create();
//     }

//     //try catch for token expiration errors and other JWT verification errors
//     try {
//       const payload = this.jwtService.verify(refreshToken);
//       console.log(payload);
      
//       request['user'] = payload;
//       return true;
//       // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     } catch (e: any) {
//       throw UnauthorizedDomainException.create();
//     }
//   }
// }
