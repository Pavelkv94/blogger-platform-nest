//* configModule должен импортироваться в первую очередь
import { configModule } from './config';
import { CoreModule } from './core/core.module';
import { Module } from '@nestjs/common';
import { UserAccountsModule } from './features/user-accounts/user-accounts.module';
import { BloggersPlatformModule } from './features/bloggers-platform/bloggers-platform.module';
import { TestingModule } from './features/testing/testing.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from './features/logger/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreConfig } from './core/core.config';
import { QuizModule } from './features/quiz/quiz.module';

@Module({
  imports: [
    //* CoreModule должен быть добавлен в первую очередь
    CoreModule,
    configModule,
    TypeOrmModule.forRootAsync({
      useFactory: (coreConfig: CoreConfig) => ({
        type: 'postgres',
        host: coreConfig.dbHost, // Адрес вашего сервера PostgreSQL
        port: coreConfig.dbPort, // Порт по умолчанию
        username: coreConfig.dbUsername, // Ваше имя пользователя
        password: coreConfig.dbPassword, // Ваш пароль
        database: coreConfig.dbName, // Имя вашей базы данных
        entities: [], // Здесь укажите ваши сущности
        autoLoadEntities: true, // Не загружать сущности автоматически - можно true для разработки
        synchronize: false, // Для разработки, включите, чтобы синхронизировать с базой данных - можно true для разработки
        logging: true,
      }),
      inject: [CoreConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        // limit: 5,
        limit: 5000,
      },
    ]),
    UserAccountsModule,
    BloggersPlatformModule,
    QuizModule,
    LoggerModule.register(process.env.INCLUDE_ENDPOINTS_LOGGER!), // Include LoggerModule conditionally
    TestingModule.register(process.env.INCLUDE_TESTING_MODULE!), //* см. ниже
    // TestingModule.registerAsync({
    //   useFactory: (coreConfig: CoreConfig) => ({
    //     includeTestingModule: coreConfig.includeTestingModule,
    //   }),
    //   inject: [CoreConfig],
    // }),
  ],
  controllers: [],
  providers: [
    //* Global throttle
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule {}

/*
export class AppModule {
  //* такой мудрёный способ мы используем, чтобы добавить к основным модулям необязательный модуль.
  //* чтобы не обращаться в декораторе к переменной окружения через process.env в декораторе, потому что
  //* запуск декораторов происходит на этапе склейки всех модулей до старта жизненного цикла самого NestJS
  static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule> {
    const testingModule: any[] = [];
    if (coreConfig.includeTestingModule) {
      testingModule.push(TestingModule);
    }

    return {
      module: AppModule,
      imports: testingModule, // Add dynamic modules here
    };
  }
}

//* init-app-module.ts
export async function initAppModule(): Promise<DynamicModule> {
  // из-за того, что нам нужно донастроить динамический AppModule, мы не можем сразу создавать приложение,
  // а создаём сначала контекст
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const coreConfig = appContext.get<CoreConfig>(CoreConfig);
  await appContext.close();

  return AppModule.forRoot(coreConfig);
}
*/
