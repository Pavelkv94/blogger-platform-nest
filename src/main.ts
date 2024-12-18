import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configApp } from './setup/app.setup';
import { CoreConfig } from './core/core.config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  // создаём на основе донастроенного модуля наше приложение(с TestingModule или без)
  // const dynamicAppModule = await initAppModule();

  const app = await NestFactory.create(AppModule);

  const coreConfig = app.get<CoreConfig>(CoreConfig);
  
  app.use(cookieParser());
  configApp(app, coreConfig);

  await app.listen(coreConfig.port, () => {
    console.log(`Server is running on port ${coreConfig.port}`);
  });
}

bootstrap();
