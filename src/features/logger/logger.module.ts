import { Module, MiddlewareConsumer, NestModule, DynamicModule, Inject } from '@nestjs/common';
import { LoggerMiddleware } from './logger.middleware';

@Module({})
export class LoggerModule implements NestModule {
  constructor(@Inject('INCLUDE_LOGGER') private readonly includeLogger: boolean) {}

  static register(env: string): DynamicModule {
    const includeLogger = env === 'true';

    return {
      module: LoggerModule,
      providers: [
        {
          provide: 'INCLUDE_LOGGER',
          useValue: includeLogger,
        },
      ],
      exports: [],
      global: false, // Adjust to true if this needs to be global
    };
  }

  // можно использовать сразу в app.module.ts
  configure(consumer: MiddlewareConsumer) {
    if (this.includeLogger) {
      consumer.apply(LoggerMiddleware).forRoutes('*'); // Apply LoggerMiddleware for all routes
    }
  }
}
