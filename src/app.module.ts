//* configModule должен импортироваться в первую очередь
import { configModule } from './config';
import { CoreConfig } from './core/core.config';
import { CoreModule } from './core/core.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './features/user-accounts/user-accounts.module';
import { BloggersPlatformModule } from './features/bloggers-platform/bloggers-platform.module.ts';
import { TestingModule } from './features/testing/testing.module';

@Module({
  imports: [
    //* CoreModule должен быть добавлен в первую очередь
    CoreModule,
    configModule,
    MongooseModule.forRootAsync({
      useFactory: (coreConfig: CoreConfig) => ({
        uri: coreConfig.mongoUrl,
        dbName: coreConfig.dbName,
      }),
      inject: [CoreConfig],
    }),
    UserAccountsModule,
    BloggersPlatformModule,
    TestingModule.register(process.env.INCLUDE_TESTING_MODULE!), //* см. ниже
  ],
  controllers: [],
  providers: [],
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
