import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configApp } from './config/app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configApp(app);

  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(`Server is running on port ${process.env.PORT ?? 3000}`);
  });
}
bootstrap();
