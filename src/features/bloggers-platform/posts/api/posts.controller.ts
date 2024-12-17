import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { CreatePostDto } from '../dto/post-create.dto';
import { UpdatePostDto } from '../dto/post-update.dto';
import { GetPostsQueryParams } from '../dto/get-posts-query-params.input-dto';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { PostViewDto } from '../dto/post-view.dto';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query-repository';
import { SwaggerPostCreate } from 'src/core/decorators/swagger/swagger-post';
import { SwaggerAuthStatus } from 'src/core/decorators/swagger/swagger-options';
import { SwaggerDelete } from 'src/core/decorators/swagger/swagger-delete';
import { SwaggerPut } from 'src/core/decorators/swagger/swagger-put';
import { SwaggerGet, SwaggerGetWith404 } from 'src/core/decorators/swagger/swagger-get';
import { PaginatedCommentViewDto, PaginatedPostViewDto } from 'src/core/dto/base.paginated.view-dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/usecases/create-post.usecase';
import { UpdatePostCommand } from '../application/usecases/update-post.usecase';
import { DeletePostCommand } from '../application/usecases/delete-post.usecase';
import { BasicAuthGuard } from 'src/core/guards/basic-auth.guard';

@ApiTags('posts') //swagger
@Controller('posts') //swagger
export class PostsController {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commandBus: CommandBus,

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
  @ApiBasicAuth() //swagger
  @UseGuards(BasicAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPostDto: CreatePostDto): Promise<PostViewDto> {
    const id = await this.commandBus.execute(new CreatePostCommand(createPostDto));
    const post = await this.postsQueryRepository.findPostByIdOrNotFoundFail(id);
    return post;
  }

  @SwaggerPut('Update a blog by ID') //swagger
  @ApiBasicAuth() //swagger
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    await this.commandBus.execute(new UpdatePostCommand(id, updatePostDto));
  }

  @SwaggerDelete('Delete post by id', 'Post ID')
  @ApiBasicAuth() //swagger
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.commandBus.execute(new DeletePostCommand(id));
  }

  //POST COMMENTS
  @SwaggerGetWith404('Get all comments for a post', PaginatedCommentViewDto, SwaggerAuthStatus.WithoutAuth) //swagger
  @Get(':id/comments')
  async findPostComments(@Query() query: GetPostsQueryParams, @Param('id') id: string) {
    const comments = await this.commentsQueryRepository.findAllComments(id, query);
    return comments;
  }
}
