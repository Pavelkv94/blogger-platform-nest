import { DynamicModule, Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogEntity, BlogSchema } from '../bloggers-platform/blogs/domain/blog.entity';
import { PostEntity, PostSchema } from '../bloggers-platform/posts/domain/post.entity';
import { CommentEntity } from '../bloggers-platform/comments/domain/comment.entity';
import { CommentSchema } from '../bloggers-platform/comments/domain/comment.entity';
import { LikeEntity, LikeSchema } from '../bloggers-platform/likes/domain/like.entity';
import { UserEntity, UserSchema } from '../user-accounts/domain/user/user.entity';
// import { CoreConfig } from 'src/core/core.config';

@Module({
  // imports: [
  //   MongooseModule.forFeature([
  //     { name: UserEntity.name, schema: UserSchema },
  //     { name: BlogEntity.name, schema: BlogSchema },
  //     { name: PostEntity.name, schema: PostSchema },
  //     { name: CommentEntity.name, schema: CommentSchema },
  //   ]),
  // ],
  // controllers: [TestingController],
})
// export class TestingModule {
//   static async registerAsync(options: { useFactory: (coreConfig: CoreConfig) => { includeTestingModule: boolean }; inject: any[] }): Promise<DynamicModule> {
//     const config = await options.useFactory(options.inject[0]);
//     console.log('Config:', config);  // Add this log
//     console.log('Injected value:', options.inject[0]); // Add this log

//     const providers = options.inject.map((provider) => ({
//       provide: provider,
//       useFactory: options.useFactory,
//       inject: options.inject,
//     }));

//     if (options.inject[0].includeTestingModule) {
//       return {
//         module: TestingModule,
//         imports: [
//           MongooseModule.forFeature([
//             { name: UserEntity.name, schema: UserSchema },
//             { name: BlogEntity.name, schema: BlogSchema },
//             { name: PostEntity.name, schema: PostSchema },
//             { name: CommentEntity.name, schema: CommentSchema },
//           ]),
//         ],
//         controllers: [TestingController],
//         providers: providers,
//       };
//     }
//     return {
//       module: TestingModule,
//       controllers: [],
//     };
//   }
// }
export class TestingModule {
  static register(env: string): DynamicModule {
    if (env === 'true') {
      return {
        module: TestingModule,
        imports: [
          MongooseModule.forFeature([
            { name: UserEntity.name, schema: UserSchema },
            { name: BlogEntity.name, schema: BlogSchema },
            { name: PostEntity.name, schema: PostSchema },
            { name: CommentEntity.name, schema: CommentSchema },
            { name: LikeEntity.name, schema: LikeSchema },

          ]),
        ],
        controllers: [TestingController],
      };
    }
    return {
      module: TestingModule,
      controllers: [],
    };
  }
}
