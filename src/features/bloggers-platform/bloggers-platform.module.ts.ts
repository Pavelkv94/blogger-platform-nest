import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogEntity, BlogSchema } from './blogs/domain/blog.entity';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/blogs.query-repository';
import { ApiTags } from '@nestjs/swagger';
import { PostsService } from './posts/application/posts.service';
import { PostsQueryRepository } from './posts/infrastructure/posts.query-repository';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostsController } from './posts/api/posts.controller';
import { PostSchema } from './posts/domain/post.entity';
import { PostEntity } from './posts/domain/post.entity';

@ApiTags('Bloggers Platform') //swagger
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BlogEntity.name, schema: BlogSchema },
      { name: PostEntity.name, schema: PostSchema },
    ]),
  ],
  exports: [],
  controllers: [BlogsController, PostsController],
  providers: [BlogsService, BlogsRepository, BlogsQueryRepository, PostsService, PostsRepository, PostsQueryRepository],
})
export class BloggersPlatformModule {}
