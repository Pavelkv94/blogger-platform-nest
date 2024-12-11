import { Global, Module } from '@nestjs/common';

//глобальный модуль для провайдеров и модулей необходимых во всех частях приложения (например LoggerService, CqrsModule, etc...)
@Global() // означает что не нужно вручную импортировать в app.module.ts
@Module({
  // exports: [GlobalLogerService],
  providers: [],
})
export class CoreModule {}
