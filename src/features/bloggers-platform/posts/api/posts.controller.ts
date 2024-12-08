import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { PostsService } from '../application/posts.service';
import { CreatePostDto } from '../dto/post-create.dto';
import { UpdatePostDto } from '../dto/post-update.dto';
import { GetPostsQueryParams } from '../dto/get-posts-query-params.input-dto';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { PostViewDto } from '../dto/post-view.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({ status: 200, type: [PostViewDto] })
  @Get()
  async findPosts(@Query() query: GetPostsQueryParams) {
    return this.postsQueryRepository.findAll(query);
  }

  @ApiOperation({ summary: 'Get post by id' })
  @ApiResponse({ status: 200, type: PostViewDto })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postsQueryRepository.findById(id);
  }

  @ApiOperation({ summary: 'Create post' })
  @ApiResponse({ status: 201, type: PostViewDto })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPostDto: CreatePostDto): Promise<PostViewDto | null> {
    const id = await this.postsService.create(createPostDto);
    const post = await this.postsQueryRepository.findById(id);
    return post;
  }

  @ApiOperation({ summary: 'Update post by id' })
  @ApiResponse({ status: 204 })
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    await this.postsService.update(id, updatePostDto);
  }

  @ApiOperation({ summary: 'Delete post by id' })
  @ApiResponse({ status: 204 })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.postsService.delete(id);
  }
}
