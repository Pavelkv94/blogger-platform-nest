import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './features/user-accounts/user-accounts.module';
import { BloggersPlatformModule } from './features/bloggers-platform/bloggers-platform.module.ts';
import { TestingModule } from './features/testing/testing.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL ?? '', {
      dbName: process.env.DB_NAME ?? 'default'
    }),
    UserAccountsModule,
    BloggersPlatformModule,
    TestingModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
