import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { PostsService } from '../application/posts.service';
import { CreatePostDto } from '../dto/post-create.dto';
import { UpdatePostDto } from '../dto/post-update.dto';
import { GetPostsQueryParams } from '../dto/get-posts-query-params.input-dto';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { PostViewDto } from '../dto/post-view.dto';
import { ApiTags } from '@nestjs/swagger';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query-repository';
import { SwaggerPostCreate } from 'src/core/decorators/swagger/swagger-post';
import { SwaggerAuthStatus } from 'src/core/decorators/swagger/swagger-options';
import { SwaggerDelete } from 'src/core/decorators/swagger/swagger-delete';
import { SwaggerPut } from 'src/core/decorators/swagger/swagger-put';
import { SwaggerGet, SwaggerGetWith404 } from 'src/core/decorators/swagger/swagger-get';
import { PaginatedCommentViewDto, PaginatedPostViewDto } from 'src/core/dto/base.paginated.view-dto';

@ApiTags('posts') //swagger
@Controller('posts') //swagger
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @SwaggerGet('Get all posts', PaginatedPostViewDto, SwaggerAuthStatus.WithoutAuth) //swagger
  @Get()
  async findPosts(@Query() query: GetPostsQueryParams) {
    return this.postsQueryRepository.findAllPosts(query);
  }

  @SwaggerGetWith404('Get post by id', PostViewDto, SwaggerAuthStatus.WithoutAuth) //swagger
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PostViewDto> {
    const post = await this.postsQueryRepository.findPostByIdOrNotFoundFail(id);
    return post;
  }

  @SwaggerPostCreate('Create post', PostViewDto, SwaggerAuthStatus.WithAuth) //swagger
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPostDto: CreatePostDto): Promise<PostViewDto> {
    const id = await this.postsService.create(createPostDto);
    const post = await this.postsQueryRepository.findPostByIdOrNotFoundFail(id);
    return post;
  }

  @SwaggerPut('Update a blog by ID') //swagger
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    await this.postsService.update(id, updatePostDto);
  }

  @SwaggerDelete('Delete post by id', 'Post ID')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.postsService.delete(id);
  }

  //POST COMMENTS
  @SwaggerGetWith404('Get all comments for a post', PaginatedCommentViewDto, SwaggerAuthStatus.WithoutAuth) //swagger
  @Get(':id/comments')
  async findPostComments(@Query() query: GetPostsQueryParams, @Param('id') id: string) {
    const comments = await this.commentsQueryRepository.findAllComments(id, query);
    return comments;
  }
}
