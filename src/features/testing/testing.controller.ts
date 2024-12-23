import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiNoContentResponse, ApiOperation } from '@nestjs/swagger';
import { BlogEntity, BlogModelType } from '../bloggers-platform/blogs/domain/blog.entity';
import { PostEntity, PostModelType } from '../bloggers-platform/posts/domain/post.entity';
import { CommentEntity, CommentModelType } from '../bloggers-platform/comments/domain/comment.entity';
import { LikeEntity, LikeModelType } from '../bloggers-platform/likes/domain/like.entity';
import { UserEntity, UserModelType } from '../user-accounts/domain/user/user.entity';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(UserEntity.name) private UserModel: UserModelType,
    @InjectModel(BlogEntity.name) private BlogModel: BlogModelType,
    @InjectModel(PostEntity.name) private PostModel: PostModelType,
    @InjectModel(CommentEntity.name) private CommentModel: CommentModelType,
    @InjectModel(LikeEntity.name) private LikeModel: LikeModelType,
  ) {}

  @ApiOperation({ summary: 'Delete all data' }) //swagger
  @ApiNoContentResponse({ description: 'All data is deleted' }) //swagger
  @Delete('all-data')
  @HttpCode(204)
  async removeAll() {
    await this.UserModel.deleteMany({});
    await this.BlogModel.deleteMany({});
    await this.PostModel.deleteMany({});
    await this.CommentModel.deleteMany({});
    await this.LikeModel.deleteMany({});
  }
}
