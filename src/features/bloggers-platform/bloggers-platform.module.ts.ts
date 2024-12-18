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

const useCases = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  CreateCommentUseCase,
  DeleteCommentUseCase,
  UpdateCommentUseCase
];

const repositories = [
  BlogsRepository,
  BlogsQueryRepository,
  PostsRepository,
  PostsQueryRepository,
  CommentsQueryRepository,
  CommentsRepository,
]

@ApiTags('Bloggers Platform') //swagger
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BlogEntity.name, schema: BlogSchema },
      { name: PostEntity.name, schema: PostSchema },
      { name: CommentEntity.name, schema: CommentSchema },
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
    ...repositories
  ],
})
export class BloggersPlatformModule {}
