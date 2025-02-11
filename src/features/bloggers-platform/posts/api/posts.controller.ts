import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { GetPostsQueryParams } from '../dto/get-posts-query-params.input-dto';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { PostViewDto } from '../dto/post-view.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SwaggerAuthStatus } from 'src/core/decorators/swagger/swagger-options';
import { SwaggerGet, SwaggerGetWith404 } from 'src/core/decorators/swagger/swagger-get';
import { PaginatedCommentViewDto, PaginatedPostViewDto } from 'src/core/dto/base.paginated.view-dto';
import { UserJwtPayloadDto } from 'src/features/user-accounts/dto/users/user-jwt-payload.dto';
import { ExtractAnyUserFromRequest, ExtractUserFromRequest } from 'src/core/decorators/param/extract-user-from-request';
import { JwtOptionalAuthGuard } from 'src/core/guards/jwt-optional-auth.guard';
import { JwtAuthPassportGuard } from 'src/core/guards/passport/jwt-auth-passport.guard';
import { CreateCommentCommand } from '../../comments/application/usecases/create-comment.usecase';
import { CreateCommentInputDto } from '../../comments/dto/create-comment.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query-repository';
import { SwaggerPut } from 'src/core/decorators/swagger/swagger-put';
import { LikeInputDto } from '../../likes/dto/like-input.dto';
import { LikePostCommand } from '../application/usecases/like-post.usecase';

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

  //POST COMMENTS
  @SwaggerGetWith404('Get all comments for a post', PaginatedCommentViewDto, SwaggerAuthStatus.WithoutAuth) //swagger
  @ApiBearerAuth() //swagger
  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id/comments')
  async findPostComments(@Query() query: GetPostsQueryParams, @Param('id') postId: string, @ExtractAnyUserFromRequest() user: UserJwtPayloadDto | null) {
    const post = await this.postsQueryRepository.findPostByIdOrNotFoundFail(postId, null);

    const userId = user ? user.userId : null;
    const comments = await this.commentsQueryRepository.findAllComments(post.id, query, userId);
    return comments;
  }

  @SwaggerGetWith404('Get all comments for a post', PaginatedCommentViewDto, SwaggerAuthStatus.WithoutAuth) //swagger
  @ApiBearerAuth() //swagger
  @UseGuards(JwtAuthPassportGuard)
  @Post(':id/comments')
  async createPostComment(@Param('id') postId: string, @Body() payload: CreateCommentInputDto, @ExtractUserFromRequest() user: UserJwtPayloadDto) {
    const post = await this.postsQueryRepository.findPostByIdOrNotFoundFail(postId, null);

    const newCommentId = await this.commandBus.execute(new CreateCommentCommand(payload, post.id, user));

    const newComment = await this.commentsQueryRepository.findCommentByIdOrNotFound(newCommentId, user.userId);
    return newComment;
  }

  //POST LIKES
  @SwaggerPut('Make like/dislike/unlike/undislike operations') //swagger
  @ApiBearerAuth() //swagger
  @UseGuards(JwtAuthPassportGuard) //* падают тесты, нужно замокать както?
  // @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeStatus(@Param('id') postId: string, @Body() payload: LikeInputDto, @ExtractUserFromRequest() user: UserJwtPayloadDto) {
    return await this.commandBus.execute(new LikePostCommand(postId, user.userId, payload.likeStatus));
  }
}
