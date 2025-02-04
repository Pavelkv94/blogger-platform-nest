// import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
// import { Connection } from 'mongoose';
import { AppModule } from '../../src/app.module';
import { deleteAllData } from './delete-all-data';
import { EmailService } from '../../src/features/notifications/email.service';
import { EmailServiceMock } from '../mock/email-service.mock';
import { configApp } from 'src/setup/app.setup';
import { CoreConfig } from 'src/core/core.config';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersTestManager } from './users-test-manager';
import { DevicesTestManager } from './devices-test-manager';
import { BlogsTestManager } from './blogs-test-manager';
import { PostsTestManager } from './posts-test-manager';

export const initSettings = async (
  //передаем callback, который получает ModuleBuilder, если хотим изменить настройку тестового модуля
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {

  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule, TypeOrmModule.forRootAsync({
      useFactory: (coreConfig: CoreConfig) => ({
        type: 'postgres',
        host: coreConfig.dbHost, // Адрес вашего сервера PostgreSQL
        port: coreConfig.dbPort, // Порт по умолчанию
        username: coreConfig.dbUsername, // Ваше имя пользователя
        password: coreConfig.dbPassword, // Ваш пароль
        database: coreConfig.dbName, // Имя вашей базы данных
        entities: [], // Здесь укажите ваши сущности
        autoLoadEntities: true, // Не загружать сущности автоматически - можно true для разработки
        synchronize: true, // Для разработки, включите, чтобы синхронизировать с базой данных - можно true для разработки
      }),
      inject: [CoreConfig],
    }),],
  })

    .overrideProvider(EmailService)
    .useClass(EmailServiceMock);

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();

  const app = testingAppModule.createNestApplication();
  const coreConfig = app.get<CoreConfig>(CoreConfig);

  configApp(app, coreConfig);

  await app.init();

  const httpServer = app.getHttpServer();
  const userTestManger = new UsersTestManager(app);
  const blogsTestManager = new BlogsTestManager(app);
  const postsTestManager = new PostsTestManager(app);
  const devicesTestManager = new DevicesTestManager(app);

  await deleteAllData(app);

  return {
    app,
    // databaseConnection,
    httpServer,
    userTestManger,
    blogsTestManager,
    postsTestManager,
    devicesTestManager,
  };
};
