import { Body, Controller, Delete, Get, HttpStatus, HttpCode, Param, Post, Query, Put, UseGuards } from '@nestjs/common';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { BlogCreateDto } from '../dto/blog-create.dto';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { BlogViewDto } from '../dto/blog-view.dto';
import { PaginatedBlogViewDto, PaginatedPostViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetBlogsQueryParams } from '../dto/get-blogs-query-params.input-dto';
import { BlogUpdateDto } from '../dto/blog-update.dto';
import { GetPostsQueryParams } from '../../posts/dto/get-posts-query-params.input-dto';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query-repository';
import { PostViewDto } from '../../posts/dto/post-view.dto';
import { CreatePostForBlogDto } from '../../posts/dto/post-create.dto';
import { SwaggerAuthStatus } from '../../../../core/decorators/swagger/swagger-options';
import { SwaggerPostCreate, SwaggerPostCreateWith404 } from '../../../../core/decorators/swagger/swagger-post';
import { SwaggerDelete } from '../../../../core/decorators/swagger/swagger-delete';
import { SwaggerPut } from '../../../../core/decorators/swagger/swagger-put';
import { SwaggerGet, SwaggerGetWith404 } from '../../../../core/decorators/swagger/swagger-get';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/usecases/create-blog.usecase';
import { UpdateBlogCommand } from '../application/usecases/update-blog.usecase';
import { DeleteBlogCommand } from '../application/usecases/delete-blog.usecase';
import { CreatePostCommand } from '../../posts/application/usecases/create-post.usecase';
import { BasicAuthGuard } from '../../../../core/guards/basic-auth.guard';
import { JwtOptionalAuthGuard } from '../../../../core/guards/jwt-optional-auth.guard';
import { ExtractAnyUserFromRequest } from '../../../../core/decorators/param/extract-user-from-request';
import { UserJwtPayloadDto } from '../../../../features/user-accounts/dto/users/user-jwt-payload.dto';
import { DeletePostCommand } from '../../posts/application/usecases/delete-post.usecase';
import { UpdatePostCommand } from '../../posts/application/usecases/update-post.usecase';
import { UpdateBlogPostDto } from '../../posts/dto/post-update.dto';

@ApiTags('Blogs') //swagger
@ApiBasicAuth() //swagger
@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class SaBlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postQueryRepository: PostsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @SwaggerGet('Get all blogs', PaginatedBlogViewDto, SwaggerAuthStatus.WithoutAuth) //swagger
  @Get()
  findBlogs(@Query() query: GetBlogsQueryParams): Promise<PaginatedBlogViewDto> {
    const blogs = this.blogsQueryRepository.findBlogs(query);
    return blogs;
  }

  @SwaggerGetWith404('Get a blog by ID', BlogViewDto, SwaggerAuthStatus.WithoutAuth) //swagger
  @Get(':id')
  async findBlogById(@Param('id') id: string): Promise<BlogViewDto> {
    
    const blog = await this.blogsQueryRepository.findBlogByIdOrNotFoundFail(id);
    return blog;
  }

  @SwaggerPostCreate('Create a new blog', BlogViewDto, SwaggerAuthStatus.WithAuth) //swagger
  @ApiBasicAuth() //swagger
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() body: BlogCreateDto): Promise<BlogViewDto> {
    const blogId = await this.commandBus.execute(new CreateBlogCommand(body));
    const newBlog = await this.blogsQueryRepository.findBlogByIdOrNotFoundFail(blogId);

    return newBlog;
  }

  @SwaggerPut('Update a blog by ID') //swagger
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateBlog(@Param('id') id: string, @Body() body: BlogUpdateDto): Promise<void> {
    return this.commandBus.execute(new UpdateBlogCommand(id, body));
  }

  @SwaggerDelete('Delete a blog by ID', 'Blog ID') //swagger
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBlog(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeleteBlogCommand(id));
  }

  // BLOG POSTS
  @SwaggerGetWith404('Get all posts by blog ID', PaginatedPostViewDto, SwaggerAuthStatus.WithoutAuth) //swagger
  @UseGuards(JwtOptionalAuthGuard)
  @Get(':blogId/posts')
  async getPostsByBlogId(
    @Query() query: GetPostsQueryParams,
    @Param('blogId') blogId: string,
    @ExtractAnyUserFromRequest() user: UserJwtPayloadDto | null,
  ): Promise<PaginatedPostViewDto> {
    const blog = await this.blogsQueryRepository.findBlogByIdOrNotFoundFail(blogId);

    const userId = user ? user.userId : null;

    const posts = await this.postQueryRepository.findAllPosts(query, userId, blog.id);

    return posts;
  }

  @SwaggerPostCreateWith404('Create a new post for a blog', PostViewDto, SwaggerAuthStatus.WithAuth) //swagger
  @Post(':blogId/posts')
  async createPostForBlog(@Param('blogId') blogId: string, @Body() body: CreatePostForBlogDto): Promise<PostViewDto> {
    const newPostId = await this.commandBus.execute(new CreatePostCommand(body, blogId));
    const newPost = await this.postQueryRepository.findPostByIdOrNotFoundFail(newPostId, null);

    return newPost;
  }

  // @SwaggerPostCreateWith404('Create a new post for a blog', PostViewDto, SwaggerAuthStatus.WithAuth) //swagger
  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostForBlog(@Param('blogId') blogId: string, @Param('postId') postId: string): Promise<void> {
    return this.commandBus.execute(new DeletePostCommand(postId, blogId));
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostForBlog(@Param('blogId') blogId: string, @Param('postId') postId: string, @Body() body: UpdateBlogPostDto): Promise<void> {
    return this.commandBus.execute(new UpdatePostCommand(postId, body, blogId));
  }
}
