import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogEntity, BlogSchema } from './blogs/domain/blog.entity';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/blogs.query-repository';
import { ApiTags } from '@nestjs/swagger';
import { PostsQueryRepository } from './posts/infrastructure/posts.query-repository';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostsController } from './posts/api/posts.controller';
import { PostSchema } from './posts/domain/post.entity';
import { PostEntity } from './posts/domain/post.entity';
import { CommentSchema } from './comments/domain/comment.entity';
import { CommentEntity } from './comments/domain/comment.entity';
import { CommentsQueryRepository } from './comments/infrastructure/comments.query-repository';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateBlogUseCase } from './blogs/application/usecases/create-blog.usecase';
import { UpdateBlogUseCase } from './blogs/application/usecases/update-blog.usecase';
import { DeleteBlogUseCase } from './blogs/application/usecases/delete-blog.usecase';
import { CreatePostUseCase } from './posts/application/usecases/create-post.usecase';
import { UpdatePostUseCase } from './posts/application/usecases/update-post.usecase';
import { DeletePostUseCase } from './posts/application/usecases/delete-post.usecase';
import { CreateCommentUseCase } from './comments/application/usecases/create-comment.usecase';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { CoreConfig } from 'src/core/core.config';
import { JwtModule } from '@nestjs/jwt';
import { DeleteCommentUseCase } from './comments/application/usecases/delete-comment.usecase';
import { CommentsController } from './comments/api/comments.controller';
import { UpdateCommentUseCase } from './comments/application/usecases/update-comment.usecase';
import { LikeCommentUseCase } from './comments/application/usecases/like-comment.usecase';
import { LikePostUseCase } from './posts/application/usecases/like-post.usecase';
import { CreateLikeUseCase } from './likes/application/usecases/create-like.usecase';
import { UpdateLikeUseCase } from './likes/application/usecases/update-like.usecase';
import { LikesRepository } from './likes/infrastructure/likes.repository';
import { LikeEntity, LikeSchema } from './likes/domain/like.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtAccessStrategy } from 'src/core/guards/passport/jwt-access.strategy';
import { BlogIsNotExistConstraint } from './posts/api/validation/blogIsExist.decorator';

const useCases = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  CreateCommentUseCase,
  DeleteCommentUseCase,
  UpdateCommentUseCase,
  LikePostUseCase,
  LikeCommentUseCase,
  CreateLikeUseCase,
  UpdateLikeUseCase
];

const repositories = [
  BlogsRepository,
  BlogsQueryRepository,
  PostsRepository,
  PostsQueryRepository,
  CommentsQueryRepository,
  CommentsRepository,
  LikesRepository
]

@ApiTags('Bloggers Platform') //swagger
@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([
      { name: BlogEntity.name, schema: BlogSchema },
      { name: PostEntity.name, schema: PostSchema },
      { name: CommentEntity.name, schema: CommentSchema },
      { name: LikeEntity.name, schema: LikeSchema },

    ]),
    JwtModule.registerAsync({
      useFactory: (coreConfig: CoreConfig) => ({
        secret: coreConfig.accessTokenSecret,
      }),
      inject: [CoreConfig],
    }),
    CqrsModule,
    //! так можно делать чтобы получить доступ к UserRepository???
    UserAccountsModule
  ],
  exports: [],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    ...useCases,
    ...repositories,
    JwtAccessStrategy,
    BlogIsNotExistConstraint
  ],
})
export class BloggersPlatformModule {}
