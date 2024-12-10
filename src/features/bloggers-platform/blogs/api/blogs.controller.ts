import { Body, Controller, Delete, Get, HttpStatus, HttpCode, Param, Post, Query, Put } from '@nestjs/common';
import { BlogsService } from '../application/blogs.service';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { BlogCreateDto } from '../dto/blog-create.dto';
import { ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
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

@ApiTags('Blogs') //swagger
@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postQueryRepository: PostsQueryRepository,
    private readonly postService: PostsService,
  ) {}

  @ApiOperation({ summary: 'Get all blogs' }) //swagger
  @ApiOkResponse({ type: PaginatedBlogViewDto }) //swagger
  @Get()
  findBlogs(@Query() query: GetBlogsQueryParams): Promise<PaginatedBlogViewDto> {
    const blogs = this.blogsQueryRepository.findBlogs(query);
    return blogs;
  }

  @ApiOperation({ summary: 'Get a blog by ID' }) //swagger
  @ApiOkResponse({ type: BlogViewDto }) //swagger
  @Get(':id')
  async findBlogByIdOrNotFoundFail(@Param('id') id: string): Promise<BlogViewDto> {
    const blog = await this.blogsQueryRepository.findBlogByIdOrNotFoundFail(id);
    if (!blog) {
      throw NotFoundDomainException.create('Blog not found');
    }
    return blog;
  }

  @ApiOperation({ summary: 'Create a new blog' }) //swagger
  @ApiOkResponse({ type: BlogViewDto }) //swagger
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() body: BlogCreateDto): Promise<BlogViewDto> {
    const blogId = await this.blogsService.createBlog(body);
    const newBlog = await this.blogsQueryRepository.findBlogByIdOrNotFoundFail(blogId);

    return newBlog;
  }

  @ApiOperation({ summary: 'Update a blog by ID' }) //swagger
  @ApiOkResponse({ type: BlogViewDto }) //swagger
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateBlog(@Param('id') id: string, @Body() body: BlogUpdateDto): Promise<void> {
    return this.blogsService.updateBlog(id, body);
  }

  @ApiOperation({ summary: 'Delete a blog by ID' }) //swagger
  @ApiNoContentResponse() //swagger
  @ApiNotFoundResponse() //swagger
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBlog(@Param('id') id: string): Promise<void> {
    return this.blogsService.deleteBlog(id);
  }

  // BLOG POSTS
  @ApiOperation({ summary: 'Get all posts by blog ID' }) //swagger
  @ApiOkResponse({ type: PaginatedPostViewDto }) //swagger
  @Get(':blogId/posts')
  async getPostsByBlogId(@Query() query: GetPostsQueryParams, @Param('blogId') blogId: string): Promise<PaginatedPostViewDto> {
    const blog = await this.blogsQueryRepository.findBlogByIdOrNotFoundFail(blogId);

    const posts = await this.postQueryRepository.findAllPosts(query, blog.id);

    return posts;
  }

  @ApiOperation({ summary: 'Create a new post for a blog' }) //swagger
  @ApiOkResponse({ type: PostViewDto }) //swagger
  @Post(':blogId/posts')
  async createPostByBlogId(@Param('blogId') blogId: string, @Body() body: CreatePostForBlogDto): Promise<PostViewDto> {
    const newPostId = await this.postService.createForBlog(body, blogId);
    const newPost = await this.postQueryRepository.findPostByIdOrNotFoundFail(newPostId);

    return newPost;
  }
}
