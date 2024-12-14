import { Body, Controller, Delete, Get, HttpStatus, HttpCode, Param, Post, Query, Put } from '@nestjs/common';
import { BlogsService } from '../application/blogs.service';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { BlogCreateDto } from '../dto/blog-create.dto';
import { ApiTags } from '@nestjs/swagger';
import { BlogViewDto } from '../dto/blog-view.dto';
import { PaginatedBlogViewDto, PaginatedPostViewDto } from 'src/core/dto/base.paginated.view-dto';
import { GetBlogsQueryParams } from '../dto/get-blogs-query-params.input-dto';
import { BlogUpdateDto } from '../dto/blog-update.dto';
import { GetPostsQueryParams } from '../../posts/dto/get-posts-query-params.input-dto';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query-repository';
import { PostViewDto } from '../../posts/dto/post-view.dto';
import { CreatePostForBlogDto } from '../../posts/dto/post-create.dto';
import { PostsService } from '../../posts/application/posts.service';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { SwaggerAuthStatus } from 'src/core/decorators/swagger/swagger-options';
import { SwaggerPostCreate, SwaggerPostCreateWith404 } from 'src/core/decorators/swagger/swagger-post';
import { SwaggerDelete } from 'src/core/decorators/swagger/swagger-delete';
import { SwaggerPut } from 'src/core/decorators/swagger/swagger-put';
import { SwaggerGet, SwaggerGetWith404 } from 'src/core/decorators/swagger/swagger-get';

@ApiTags('Blogs') //swagger
@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postQueryRepository: PostsQueryRepository,
    private readonly postService: PostsService,
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
    if (!blog) {
      throw NotFoundDomainException.create('Blog not found');
    }
    return blog;
  }

  @SwaggerPostCreate('Create a new blog', BlogViewDto, SwaggerAuthStatus.WithAuth) //swagger
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() body: BlogCreateDto): Promise<BlogViewDto> {
    const blogId = await this.blogsService.createBlog(body);
    const newBlog = await this.blogsQueryRepository.findBlogByIdOrNotFoundFail(blogId);

    return newBlog;
  }

  @SwaggerPut('Update a blog by ID') //swagger
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateBlog(@Param('id') id: string, @Body() body: BlogUpdateDto): Promise<void> {
    return this.blogsService.updateBlog(id, body);
  }

  @SwaggerDelete('Delete a blog by ID', 'Blog ID')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBlog(@Param('id') id: string): Promise<void> {
    return this.blogsService.deleteBlog(id);
  }

  // BLOG POSTS
  @SwaggerGetWith404('Get all posts by blog ID', PaginatedPostViewDto, SwaggerAuthStatus.WithoutAuth) //swagger
  @Get(':blogId/posts')
  async getPostsByBlogId(@Query() query: GetPostsQueryParams, @Param('blogId') blogId: string): Promise<PaginatedPostViewDto> {

    //! ask
    const blog = await this.blogsQueryRepository.findBlogByIdOrNotFoundFail(blogId);

    const posts = await this.postQueryRepository.findAllPosts(query, blog.id);

    return posts;
  }

  @SwaggerPostCreateWith404('Create a new post for a blog', PostViewDto, SwaggerAuthStatus.WithAuth) //swagger
  @Post(':blogId/posts')
  async createPostByBlogId(@Param('blogId') blogId: string, @Body() body: CreatePostForBlogDto): Promise<PostViewDto> {
    const newPostId = await this.postService.createForBlog(body, blogId);
    const newPost = await this.postQueryRepository.findPostByIdOrNotFoundFail(newPostId);

    return newPost;
  }
}
