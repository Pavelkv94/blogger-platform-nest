import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { BlogViewDto } from '../dto/blog-view.dto';
import { PaginatedBlogViewDto, PaginatedPostViewDto } from 'src/core/dto/base.paginated.view-dto';
import { GetBlogsQueryParams } from '../dto/get-blogs-query-params.input-dto';
import { GetPostsQueryParams } from '../../posts/dto/get-posts-query-params.input-dto';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query-repository';
import { SwaggerAuthStatus } from 'src/core/decorators/swagger/swagger-options';
import { SwaggerGet, SwaggerGetWith404 } from 'src/core/decorators/swagger/swagger-get';
import { JwtOptionalAuthGuard } from 'src/core/guards/jwt-optional-auth.guard';
import { ExtractAnyUserFromRequest } from 'src/core/decorators/param/extract-user-from-request';
import { UserJwtPayloadDto } from 'src/features/user-accounts/dto/users/user-jwt-payload.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Blogs') //swagger
@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postQueryRepository: PostsQueryRepository,
  ) {}

  @SwaggerGet('Get all blogs', PaginatedBlogViewDto, SwaggerAuthStatus.WithoutAuth) //swagger
  @Get()
  findBlogs(@Query() query: GetBlogsQueryParams): Promise<PaginatedBlogViewDto> {
    const blogs = this.blogsQueryRepository.findBlogs(query);
    return blogs;
  }

  @SwaggerGetWith404('Get a blog by ID', BlogViewDto, SwaggerAuthStatus.WithoutAuth) //swagger
  @Get(':id')
  async findBlogByIdOrNotFoundFail(@Param('id') id: string): Promise<BlogViewDto> {

    const blog = await this.blogsQueryRepository.findBlogByIdOrNotFoundFail(id);
    return blog;
  }

  // @SwaggerPostCreate('Create a new blog', BlogViewDto, SwaggerAuthStatus.WithAuth) //swagger
  // @ApiBasicAuth() //swagger
  // @UseGuards(BasicAuthGuard)
  // @Post()
  // @HttpCode(HttpStatus.CREATED)
  // async createBlog(@Body() body: BlogCreateDto): Promise<BlogViewDto> {
  //   const blogId = await this.commandBus.execute(new CreateBlogCommand(body));
  //   const newBlog = await this.blogsQueryRepository.findBlogByIdOrNotFoundFail(blogId);

  //   return newBlog;
  // }

  // @SwaggerPut('Update a blog by ID') //swagger
  // @ApiBasicAuth() //swagger
  // @UseGuards(BasicAuthGuard)
  // @Put(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // updateBlog(@Param('id') id: string, @Body() body: BlogUpdateDto): Promise<void> {
  //   return this.commandBus.execute(new UpdateBlogCommand(id, body));
  // }

  // @SwaggerDelete('Delete a blog by ID', 'Blog ID') //swagger
  // @ApiBasicAuth() //swagger
  // @UseGuards(BasicAuthGuard)
  // @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // deleteBlog(@Param('id') id: string): Promise<void> {
  //   return this.commandBus.execute(new DeleteBlogCommand(id));
  // }

  // BLOG POSTS
  @SwaggerGetWith404('Get all posts by blog ID', PaginatedPostViewDto, SwaggerAuthStatus.WithoutAuth) //swagger
  @UseGuards(JwtOptionalAuthGuard)
  @Get(':blogId/posts')
  async getPostsByBlogId(
    @Query() query: GetPostsQueryParams,
    @Param('blogId') blogId: string,
    @ExtractAnyUserFromRequest() user: UserJwtPayloadDto | null,
  ): Promise<PaginatedPostViewDto> {
    try {
      const blog = await this.blogsQueryRepository.findBlogByIdOrNotFoundFail(blogId);

    const userId = user ? user.userId : null;

    const posts = await this.postQueryRepository.findAllPosts(query, userId, blog.id);

      return posts;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // @SwaggerPostCreateWith404('Create a new post for a blog', PostViewDto, SwaggerAuthStatus.WithAuth) //swagger
  // @ApiBasicAuth() //swagger
  // @UseGuards(BasicAuthGuard)
  // @Post(':blogId/posts')
  // async createPostForBlog(@Param('blogId') blogId: string, @Body() body: CreatePostForBlogDto): Promise<PostViewDto> {
  //   const newPostId = await this.commandBus.execute(new CreatePostCommand(body, blogId));
  //   const newPost = await this.postQueryRepository.findPostByIdOrNotFoundFail(newPostId, null);

  //   return newPost;
  // }
}
