//* configModule должен импортироваться в первую очередь
import { configModule } from './config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './features/user-accounts/user-accounts.module';
import { BloggersPlatformModule } from './features/bloggers-platform/bloggers-platform.module.ts';
import { TestingModule } from './features/testing/testing.module';
import { CoreConfig } from './core/core.config';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    //* CoreModule должен быть импортирован в первую очередь
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
    TestingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

//* такой мудрёный способ мы используем, чтобы добавить к основным модулям необязательный модуль.
//* чтобы не обращаться в декораторе к переменной окружения через process.env в декораторе, потому что
//* запуск декораторов происходит на этапе склейки всех модулей до старта жизненного цикла самого NestJS
// @Module({
//   imports: [
//     MongooseModule.forRootAsync({
//       useFactory: (coreConfig: CoreConfig) => {
//         const uri = coreConfig.mongoURI;
//         console.log('DB_URI', uri);

//         return {
//           uri: uri,
//         };
//       },
//       inject: [CoreConfig],
//     }),
//     UserAccountsModule, //все модули должны быть заимпортированы в корневой модуль, либо напрямую, либо по цепочке (через другие модули)
//     BloggersPlatformModule,
//     CoreModule,
//     NotificationsModule,
//     configModule,
//   ],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {
//   static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule> {
//     // такой мудрёный способ мы используем, чтобы добавить к основным модулям необязательный модуль.
//     // чтобы не обращаться в декораторе к переменной окружения через process.env в декораторе, потому что
//     // запуск декораторов происходит на этапе склейки всех модулей до старта жизненного цикла самого NestJS
//     const testingModule: any[] = [];
//     if (coreConfig.includeTestingModule) {
//       testingModule.push(TestingModule);
//     }

//     return {
//       module: AppModule,
//       imports: testingModule, // Add dynamic modules here
//     };
//   }
// }


//* init-app-module.ts
// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { CoreConfig } from './core/core.config';
// import { DynamicModule } from '@nestjs/common';

// export async function initAppModule(): Promise<DynamicModule> {
//   // из-за того, что нам нужно донастроить динамический AppModule, мы не можем сразу создавать приложение,
//   // а создаём сначала контекст
//   const appContext = await NestFactory.createApplicationContext(AppModule);
//   const coreConfig = appContext.get<CoreConfig>(CoreConfig);
//   await appContext.close();

//   return AppModule.forRoot(coreConfig);
// }