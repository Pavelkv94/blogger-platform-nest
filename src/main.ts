import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configApp } from './setup/app.setup';
import { CoreConfig } from './core/core.config';

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);

  const coreConfig = app.get<CoreConfig>(CoreConfig);

  configApp(app, coreConfig);

  await app.listen(coreConfig.port, () => {
    console.log(`Server is running on port ${coreConfig.port}`);
  });
}

bootstrap();
