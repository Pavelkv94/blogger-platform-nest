import { ArgumentsHost, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

//TODO Пример простого для понимания Exeption Filter
// чтобы работало нужно в pipes.setup.ts сделать простой пайп:
// new ValidationPipe({
//   transform: true,
// }),
// и зарегистрировать в exception-filter.setup.ts

export class SimpleExeptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const getField = (str: string) => {
      return str.split(' ')[0];
    };
    if (status === 400) {
      const errors: any[] = [];

      const responseBody: any = exception.getResponse();

      responseBody.message.forEach((element: any) => {
        errors.push({ message: element.message, field: getField(element) });
      });

      response.status(status).json({
        statusCode: status,
        path: request.url,
        message: (exception as any).message || 'Internal server error',
        errors: errors,
      });
    } else {
      response.status(status).json({
        statusCode: status,
        path: request.url,
        message: (exception as any).message || 'Internal server error',
      });
    }
  }
}
