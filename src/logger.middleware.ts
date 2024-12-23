import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.on('finish', () => {
      console.log(`${res.statusCode >= 400 ? "\x1b[31m" : "\x1b[32m"} Request: ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`);
    });
    next();
  }
}