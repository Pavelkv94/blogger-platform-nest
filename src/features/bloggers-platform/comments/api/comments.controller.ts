import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository';
import { CommentViewDto } from '../dto/comment-view.dto';
import { SwaggerGetWith404 } from 'src/core/decorators/swagger/swagger-get';
import { SwaggerAuthStatus } from 'src/core/decorators/swagger/swagger-options';

@ApiTags('Comments') //swagger
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsQueryRepository: CommentsQueryRepository) {}

  @SwaggerGetWith404('Get a comment by ID', CommentViewDto, SwaggerAuthStatus.WithoutAuth) //swagger
  @Get(':id')
  getComment(@Param('id') id: string): Promise<CommentViewDto | null> {
    return this.commentsQueryRepository.findCommentById(id);
  }
}
