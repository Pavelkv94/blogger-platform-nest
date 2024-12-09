import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, Query, NotFoundException } from '@nestjs/common';
import { PostsService } from '../application/posts.service';
import { CreatePostDto } from '../dto/post-create.dto';
import { UpdatePostDto } from '../dto/post-update.dto';
import { GetPostsQueryParams } from '../dto/get-posts-query-params.input-dto';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { PostViewDto } from '../dto/post-view.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommentViewDto } from '../../comments/dto/comment-view.dto';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query-repository';

@ApiTags('posts') //swagger
@Controller('posts') //swagger
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @ApiOperation({ summary: 'Get all posts' }) //swagger
  @ApiResponse({ status: 200, type: [PostViewDto] }) //swagger
  @Get()
  async findPosts(@Query() query: GetPostsQueryParams) {
    return this.postsQueryRepository.findAllPosts(query);
  }

  @ApiOperation({ summary: 'Get post by id' })
  @ApiResponse({ status: 200, type: PostViewDto })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PostViewDto> {
    const post = await this.postsQueryRepository.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  @ApiOperation({ summary: 'Create post' }) //swagger
  @ApiResponse({ status: 201, type: PostViewDto }) //swagger
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPostDto: CreatePostDto): Promise<PostViewDto | null> {
    const id = await this.postsService.create(createPostDto);
    const post = await this.postsQueryRepository.findById(id);
    return post;
  }

  @ApiOperation({ summary: 'Update post by id' }) //swagger
  @ApiResponse({ status: 204 }) //swagger
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

  //POST COMMENTS
  @ApiOperation({ summary: 'Get all comments for a post' })
  @ApiResponse({ status: 200, type: [CommentViewDto] })
  @Get(':id/comments')
  async findPostComments(@Query() query: GetPostsQueryParams, @Param('id') id: string) {
    const comments = await this.commentsQueryRepository.findAllComments(id, query);
    return comments;
  }
}
