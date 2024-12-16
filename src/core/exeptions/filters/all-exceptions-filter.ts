//Все ошибки
import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from './base-exception-filter';
import { Request, Response } from 'express';
import { CoreConfig } from 'src/core/core.config';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  constructor(private readonly coreConfig: CoreConfig) {
    super();
  }

  onCatch(exception: unknown, response: Response, request: Request): void {
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    //TODO: Replace with getter from configService
    const isProduction = this.coreConfig.env === 'production';

    if (isProduction && status === HttpStatus.INTERNAL_SERVER_ERROR) {
      response.status(status).json({
        ...this.getDefaultHttpBody(request.url, exception),
        path: null,
        message: 'Some error occurred',
      });

      return;
    }

    response.status(status).json(this.getDefaultHttpBody(request.url, exception));
  }
}
