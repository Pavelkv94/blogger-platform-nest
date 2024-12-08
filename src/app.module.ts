import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './features/user-accounts/user-accounts.module';
import { BloggersPlatformModule } from './features/bloggers-platform/bloggers-platform.module.ts';
import { TestingModule } from './features/testing/testing.module';

@Module({
  imports: [MongooseModule.forRoot('mongodb://0.0.0.0:27017', { dbName: 'Incubator-hw-db' }), UserAccountsModule, BloggersPlatformModule, TestingModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
