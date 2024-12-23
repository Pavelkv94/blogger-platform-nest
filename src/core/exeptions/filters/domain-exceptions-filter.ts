//Ошибки класса DomainException (instanceof DomainException)
import { Catch, HttpStatus } from '@nestjs/common';
import { DomainException } from '../domain-exceptions';
import { BaseExceptionFilter } from './base-exception-filter';
import { Request, Response } from 'express';
import { DomainExceptionCode } from '../domain-exception-codes';

@Catch(DomainException)
export class DomainExceptionsFilter extends BaseExceptionFilter {
  onCatch(exception: DomainException, response: Response, request: Request): void {

    response.status(this.calculateHttpCode(exception)).json(this.getDefaultHttpBody(request.url, exception));
  }

  calculateHttpCode(exception: DomainException) {
    switch (exception.code) {
      case DomainExceptionCode.BadRequest: {
        return HttpStatus.BAD_REQUEST;
      }
      case DomainExceptionCode.Forbidden: {
        return HttpStatus.FORBIDDEN;
      }
      case DomainExceptionCode.NotFound: {
        return HttpStatus.NOT_FOUND;
      }
      case DomainExceptionCode.Unauthorized: {
        return HttpStatus.UNAUTHORIZED;
      }
      case DomainExceptionCode.TooManyRequests: {
        return HttpStatus.TOO_MANY_REQUESTS;
      }
      default: {
        return HttpStatus.I_AM_A_TEAPOT;
      }
    }
  }
}
