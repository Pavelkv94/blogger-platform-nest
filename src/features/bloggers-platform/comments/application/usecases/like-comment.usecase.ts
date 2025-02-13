import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestDomainException, NotFoundDomainException } from '../../../../../core/exeptions/domain-exceptions';
import { LikeStatus } from '../../../likes/dto/like-status.dto';
import { LikesRepository } from '../../../likes/infrastructure/likes.repository';
import { CreateLikeCommand } from '../../../likes/application/usecases/create-like.usecase';
import { UpdateLikeCommand } from '../../../likes/application/usecases/update-like.usecase';
import { LikeParent } from '../../../likes/dto/like-parent.dto';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { ResultStatus } from '../../../../../core/dto/result-object.dto';

export class LikeCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
    public readonly newStatus: LikeStatus,
  ) {}
}

@CommandHandler(LikeCommentCommand)
export class LikeCommentUseCase implements ICommandHandler<LikeCommentCommand> {
  constructor(
    private readonly likesRepository: LikesRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: LikeCommentCommand): Promise<void> {
    if (!command.newStatus) {
      throw BadRequestDomainException.create('Like status not found', 'likeStatus');
    }

    if (!command.commentId) {
      throw NotFoundDomainException.create('Comment not found');
    }

    const commentsResultObject = await this.commentsRepository.findCommentById(command.commentId);

    if (commentsResultObject.status === ResultStatus.NOT_FOUND) {
      throw NotFoundDomainException.create('Comment not found');
    }

    const like = await this.likesRepository.findLike(command.userId, command.commentId);

    if (like) {
      await this.commandBus.execute(new UpdateLikeCommand(like, command.newStatus));
    } else {
      await this.commandBus.execute(new CreateLikeCommand(command.userId, command.commentId, command.newStatus, LikeParent.Comment));
    }
  }
}
