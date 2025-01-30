import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository';
import { CommentViewDto } from '../dto/comment-view.dto';
import { SwaggerGetWith404 } from 'src/core/decorators/swagger/swagger-get';
import { SwaggerAuthStatus } from 'src/core/decorators/swagger/swagger-options';
import { DeleteCommentCommand } from '../application/usecases/delete-comment.usecase';
import { CommandBus } from '@nestjs/cqrs';
import { ExtractAnyUserFromRequest, ExtractUserFromRequest } from 'src/core/decorators/param/extract-user-from-request';
import { UserJwtPayloadDto } from 'src/features/user-accounts/dto/users/user-jwt-payload.dto';
import { UpdateCommentInputDto } from '../dto/update-comment.dto';
import { UpdateCommentCommand } from '../application/usecases/update-comment.usecase';
import { SwaggerPut } from 'src/core/decorators/swagger/swagger-put';
import { LikeInputDto } from '../../likes/dto/like-input.dto';
import { LikeCommentCommand } from '../application/usecases/like-comment.usecase';
import { JwtOptionalAuthGuard } from 'src/core/guards/jwt-optional-auth.guard';
import { JwtAuthPassportGuard } from 'src/core/guards/passport/jwt-auth-passport.guard';

@ApiTags('Comments') //swagger
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @SwaggerGetWith404('Get a comment by ID', CommentViewDto, SwaggerAuthStatus.WithoutAuth) //swagger
  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  getComment(@Param('id') id: string, @ExtractAnyUserFromRequest() user: UserJwtPayloadDto | null ): Promise<CommentViewDto | null> {
    const userId = user ? user.userId : null;
    return this.commentsQueryRepository.findCommentByIdOrNotFound(id, userId);
  }

  // @SwaggerGetWith404('Get a comment by ID', CommentViewDto, SwaggerAuthStatus.WithoutAuth) //swagger
  @ApiBearerAuth() //swagger
  @UseGuards(JwtAuthPassportGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateComment(@Param('id') commentId: string, @Body() payload: UpdateCommentInputDto, @ExtractUserFromRequest() user: UserJwtPayloadDto): Promise<void> {
    return this.commandBus.execute(new UpdateCommentCommand(commentId, user.userId, payload));
  }

  // @SwaggerGetWith404('Get a comment by ID', CommentViewDto, SwaggerAuthStatus.WithoutAuth) //swagger
  @ApiBearerAuth() //swagger
  @UseGuards(JwtAuthPassportGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteComment(@Param('id') commentId: string, @ExtractUserFromRequest() user: UserJwtPayloadDto): Promise<void> {
    return this.commandBus.execute(new DeleteCommentCommand(commentId, user.userId));
  }

  //COMMENT LIKES
  @SwaggerPut('Make like/dislike/unlike/undislike operations') //swagger
  @ApiBearerAuth() //swagger
  @UseGuards(JwtAuthPassportGuard)
  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeStatus(@Param('id') commentId: string, @Body() payload: LikeInputDto, @ExtractUserFromRequest() user: UserJwtPayloadDto) {
    await this.commandBus.execute(new LikeCommentCommand(commentId, user.userId, payload.likeStatus));
  }
}
