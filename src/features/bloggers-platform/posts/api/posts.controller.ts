import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { CreatePostDto } from '../dto/post-create.dto';
import { UpdatePostDto } from '../dto/post-update.dto';
import { GetPostsQueryParams } from '../dto/get-posts-query-params.input-dto';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { PostViewDto } from '../dto/post-view.dto';
import { ApiBasicAuth, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
import { CreateCommentInputDto } from '../../comments/dto/create-comment.dto';
import { CreateCommentCommand } from '../../comments/application/usecases/create-comment.usecase';
import { UserJwtPayloadDto } from 'src/features/user-accounts/dto/user-jwt-payload.dto';
import { ExtractAnyUserFromRequest, ExtractUserFromRequest } from 'src/core/decorators/param/extract-user-from-request';
import { LikeInputDto } from '../../likes/dto/like-input.dto';
import { LikePostCommand } from '../application/usecases/like-post.usecase';
import { JwtOptionalAuthGuard } from 'src/core/guards/jwt-optional-auth.guard';
import { JwtAuthPassportGuard } from 'src/core/guards/passport/jwt-auth-passport.guard';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';

@ApiTags('posts') //swagger
@Controller('posts') //swagger
export class PostsController {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @SwaggerGet('Get all posts', PaginatedPostViewDto, SwaggerAuthStatus.WithoutAuth) //swagger
  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  async findPosts(@Query() query: GetPostsQueryParams, @ExtractAnyUserFromRequest() user: UserJwtPayloadDto | null) {
    const userId = user ? user.userId : null;
    return this.postsQueryRepository.findAllPosts(query, userId);
  }

  @SwaggerGetWith404('Get post by id', PostViewDto, SwaggerAuthStatus.WithoutAuth) //swagger
  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @ExtractAnyUserFromRequest() user: UserJwtPayloadDto | null): Promise<PostViewDto> {
    const userId = user ? user.userId : null;
    const post = await this.postsQueryRepository.findPostByIdOrNotFoundFail(id, userId);
    return post;
  }

  @SwaggerPostCreate('Create post', PostViewDto, SwaggerAuthStatus.WithAuth) //swagger
  @ApiBasicAuth() //swagger
  @UseGuards(BasicAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPostDto: CreatePostDto): Promise<PostViewDto> {
    const id = await this.commandBus.execute(new CreatePostCommand(createPostDto));
    const post = await this.postsQueryRepository.findPostByIdOrNotFoundFail(id, null);
    return post;
  }

  @SwaggerPut('Update a post by ID') //swagger
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
  @ApiBearerAuth() //swagger
  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id/comments')
  async findPostComments(@Query() query: GetPostsQueryParams, @Param('id') postId: string, @ExtractAnyUserFromRequest() user: UserJwtPayloadDto | null) {
    const userId = user ? user.userId : null;
    const comments = await this.commentsQueryRepository.findAllComments(postId, query, userId);
    return comments;
  }

  @SwaggerGetWith404('Get all comments for a post', PaginatedCommentViewDto, SwaggerAuthStatus.WithoutAuth) //swagger
  @ApiBearerAuth() //swagger
  @UseGuards(JwtAuthPassportGuard)
  @Post(':id/comments')
  async createPostComment(@Param('id') postId: string, @Body() payload: CreateCommentInputDto, @ExtractUserFromRequest() user: UserJwtPayloadDto) {
    const newCommentId = await this.commandBus.execute(new CreateCommentCommand(payload, postId, user));

    const newComment = await this.commentsQueryRepository.findCommentByIdOrNotFound(newCommentId, user.userId);
    return newComment;
  }

  //POST LIKES
  @SwaggerPut('Make like/dislike/unlike/undislike operations') //swagger
  @ApiBearerAuth() //swagger
  //! @UseGuards(JwtAuthPassportGuard) //* падают тесты, нужно замокать както?
  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeStatus(@Param('id') postId: string, @Body() payload: LikeInputDto, @ExtractUserFromRequest() user: UserJwtPayloadDto) {
    await this.commandBus.execute(new LikePostCommand(postId, user.userId, payload.likeStatus));
  }
}
