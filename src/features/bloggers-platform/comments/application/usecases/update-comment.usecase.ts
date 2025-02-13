import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCommentInputDto } from '../../dto/create-comment.dto';
import { ForbiddenDomainException, NotFoundDomainException } from '../../../../../core/exeptions/domain-exceptions';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { ResultStatus } from '../../../../../core/dto/result-object.dto';

export class UpdateCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
    public readonly payload: CreateCommentInputDto,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(command: UpdateCommentCommand): Promise<void> {
    if (!command.commentId) {
      throw NotFoundDomainException.create('Comment not found');
    }
    const resultObject = await this.commentsRepository.findCommentById(command.commentId, command.userId);

    if (resultObject.status === ResultStatus.NOT_FOUND) {
      throw NotFoundDomainException.create(resultObject.errorMessage);
    }

    if (resultObject.status === ResultStatus.FORBIDDEN) {
      throw ForbiddenDomainException.create(resultObject.errorMessage);
    }
    if (resultObject.status === ResultStatus.SUCCESS) {
      await this.commentsRepository.updateComment(resultObject.data, command.payload.content);
    }
  }
}
