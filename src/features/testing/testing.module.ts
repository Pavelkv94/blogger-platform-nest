import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserEntity, UserSchema } from '../user-accounts/domain/user.entity';
import { BlogEntity, BlogSchema } from '../bloggers-platform/blogs/domain/blog.entity';
import { PostEntity, PostSchema } from '../bloggers-platform/posts/domain/post.entity';
import { CommentEntity } from '../bloggers-platform/comments/domain/comment.entity';
import { CommentSchema } from '../bloggers-platform/comments/domain/comment.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserEntity.name, schema: UserSchema },
      { name: BlogEntity.name, schema: BlogSchema },
      { name: PostEntity.name, schema: PostSchema },
      { name: CommentEntity.name, schema: CommentSchema },
    ]),
  ],
  controllers: [TestingController],
})
export class TestingModule {}
