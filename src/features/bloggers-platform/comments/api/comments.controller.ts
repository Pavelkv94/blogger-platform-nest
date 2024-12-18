import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository';
import { CommentViewDto } from '../dto/comment-view.dto';
import { SwaggerGetWith404 } from 'src/core/decorators/swagger/swagger-get';
import { SwaggerAuthStatus } from 'src/core/decorators/swagger/swagger-options';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { DeleteCommentCommand } from '../application/usecases/delete-comment.usecase';
import { CommandBus } from '@nestjs/cqrs';
import { ExtractUserFromRequest } from 'src/core/decorators/param/extract-user-from-request';
import { UserJwtPayloadDto } from 'src/features/user-accounts/dto/user-jwt-payload.dto';
import { UpdateCommentInputDto } from '../dto/update-comment.dto';
import { UpdateCommentCommand } from '../application/usecases/update-comment.usecase';

@ApiTags('Comments') //swagger
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @SwaggerGetWith404('Get a comment by ID', CommentViewDto, SwaggerAuthStatus.WithoutAuth) //swagger
  @Get(':id')
  getComment(@Param('id') id: string): Promise<CommentViewDto | null> {
    return this.commentsQueryRepository.findCommentByIdOrNotFound(id);
  }

  @ApiBearerAuth() //swagger
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateComment(@Param('id') commentId: string, @Body() payload: UpdateCommentInputDto, @ExtractUserFromRequest() user: UserJwtPayloadDto): Promise<void> {
    return this.commandBus.execute(new UpdateCommentCommand(commentId, user.userId, payload));
  }

  // @SwaggerGetWith404('Get a comment by ID', CommentViewDto, SwaggerAuthStatus.WithoutAuth) //swagger
  @ApiBearerAuth() //swagger
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteComment(@Param('id') commentId: string, @ExtractUserFromRequest() user: UserJwtPayloadDto): Promise<void> {
    return this.commandBus.execute(new DeleteCommentCommand(commentId, user.userId));
  }
}
