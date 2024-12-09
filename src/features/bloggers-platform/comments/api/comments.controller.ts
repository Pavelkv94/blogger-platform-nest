import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository';
import { CommentViewDto } from '../dto/comment-view.dto';

@ApiTags('Comments') //swagger
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsQueryRepository: CommentsQueryRepository) {}
  
  @ApiOperation({ summary: 'Get a comment by ID' }) //swagger
  @ApiOkResponse({ type: CommentViewDto }) //swagger
  @Get(':id')
  getComment(@Param('id') id: string): Promise<CommentViewDto | null> {
    return this.commentsQueryRepository.findCommentById(id);
  }
}
