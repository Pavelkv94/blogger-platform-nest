import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException, ErrorExtension } from '../domain-exceptions';

export type ValidationErrorResponse = {
  errorsMessages: ErrorExtension[];
};

export type StandardErrorResponse = {
  timestamp: string;
  path: string;
  message: string;
  code: string | null;
};

export abstract class BaseExceptionFilter implements ExceptionFilter {
  abstract onCatch(exception: any, response: Response, request: Request): void;

  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    this.onCatch(exception, response, request);
  }

  getDefaultHttpBody(url: string, exception: unknown): ValidationErrorResponse | StandardErrorResponse {
    if (exception instanceof DomainException && exception.extensions.length > 0) {
      // Return validation error format
      return {
        errorsMessages: exception.extensions,
      };
    }

    // Return standard error format for other types of errors
    return {
      timestamp: new Date().toISOString(),
      path: url,
      message: (exception as any).message || 'Internal server error',
      code: exception instanceof DomainException ? exception.code.toString() : null,
    };
  }
}