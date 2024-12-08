import { Body, Controller, Delete, Get, HttpStatus, HttpCode, Param, Post, Query, Put } from '@nestjs/common';
import { BlogsService } from '../application/blogs.service';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { BlogCreateDto } from '../dto/blog-create.dto';
import { ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BlogViewDto } from '../dto/blog-view.dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { GetBlogsQueryParams } from '../dto/get-blogs-query-params.input-dto';
import { BlogUpdateDto } from '../dto/blog-update.dto';

@ApiTags('Blogs') //swagger
@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @ApiOperation({ summary: 'Get all blogs' }) //swagger
  @ApiOkResponse({ type: PaginatedViewDto }) //swagger
  @Get()
  getBlogs(@Query() query: GetBlogsQueryParams): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const blogs = this.blogsQueryRepository.findBlogs(query);
    return blogs;
  }

  @ApiOperation({ summary: 'Get a blog by ID' }) //swagger
  @ApiOkResponse({ type: BlogViewDto }) //swagger
  @Get(':id')
  getBlog(@Param('id') id: string) {
    return this.blogsQueryRepository.findBlogById(id);
  }

  @ApiOperation({ summary: 'Create a new blog' }) //swagger
  @ApiOkResponse({ type: BlogViewDto }) //swagger
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() body: BlogCreateDto) {
    const blogId = await this.blogsService.createBlog(body);
    const newBlog = await this.blogsQueryRepository.findBlogById(blogId);

    return newBlog;
  }

  @ApiOperation({ summary: 'Update a blog by ID' }) //swagger
  @ApiOkResponse({ type: BlogViewDto }) //swagger
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateBlog(@Param('id') id: string, @Body() body: BlogUpdateDto) {
    return this.blogsService.updateBlog(id, body);
  }

  @ApiOperation({ summary: 'Delete a blog by ID' }) //swagger
  @ApiNoContentResponse() //swagger
  @ApiNotFoundResponse() //swagger
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBlog(@Param('id') id: string) {
    return this.blogsService.deleteBlog(id);
  }
}
