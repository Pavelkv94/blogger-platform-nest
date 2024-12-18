import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenDomainException, NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { ResultStatus } from 'src/core/dto/result-object.dto';

export class DeleteCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand> {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(command: DeleteCommentCommand): Promise<void> {
    const resultObject = await this.commentsRepository.findCommentById(command.commentId, command.userId);

    if (resultObject.status === ResultStatus.NOT_FOUND) {
      throw NotFoundDomainException.create(resultObject.errorMessage);
    }

    if (resultObject.status === ResultStatus.FORBIDDEN) {
      throw ForbiddenDomainException.create(resultObject.errorMessage);
    }
    if (resultObject.status === ResultStatus.SUCCESS) {
      resultObject.data!.makeDeleted();
      await this.commentsRepository.save(resultObject.data!);
    }
  }
}
