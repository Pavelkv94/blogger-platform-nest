import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestDomainException, NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { LikeStatus } from 'src/features/bloggers-platform/likes/dto/like-status.dto';
import { LikesRepository } from 'src/features/bloggers-platform/likes/infrastructure/likes.repository';
import { LikeDocument } from 'src/features/bloggers-platform/likes/domain/like.entity';
import { CreateLikeCommand } from 'src/features/bloggers-platform/likes/application/usecases/create-like.usecase';
import { UpdateLikeCommand } from 'src/features/bloggers-platform/likes/application/usecases/update-like.usecase';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { ResultStatus } from 'src/core/dto/result-object.dto';

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

    const like = await this.likesRepository.findLike(command.userId, command.commentId);

    await this.updateCommentLikesCount(command.commentId, like, command.newStatus);

    if (like) {
      await this.commandBus.execute(new UpdateLikeCommand(like, command.newStatus));
    } else {
      await this.commandBus.execute(new CreateLikeCommand(command.userId, command.commentId, command.newStatus));
    }
  }

  private async updateCommentLikesCount(postId: string, likeDocument: LikeDocument | null, newStatus: LikeStatus): Promise<void> {
    const commentResultObject = await this.commentsRepository.findCommentById(postId);

    if (commentResultObject.status === ResultStatus.NOT_FOUND || commentResultObject.status === ResultStatus.FORBIDDEN) {
      throw NotFoundDomainException.create();
    }

    if (!likeDocument) {
      //first like
      commentResultObject.data!.countLikes(LikeStatus.None, newStatus);
    } else {
      //existing like
      commentResultObject.data!.countLikes(likeDocument.status, newStatus);
    }

    await this.commentsRepository.save(commentResultObject.data!);
  }
}
