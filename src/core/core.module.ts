import { Global, Module } from '@nestjs/common';
import { CoreConfig } from './core.config';

//глобальный модуль для провайдеров и модулей необходимых во всех частях приложения (например LoggerService, CqrsModule, etc...)
@Global() // означает что не нужно вручную импортировать в app.module.ts
@Module({
  exports: [CoreConfig],
  providers: [CoreConfig],
})
export class CoreModule {}
