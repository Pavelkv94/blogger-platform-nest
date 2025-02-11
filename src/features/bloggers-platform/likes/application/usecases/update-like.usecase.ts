import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../dto/like-status.dto';
import { LikesRepository } from '../../infrastructure/likes.repository';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';

export class UpdateLikeCommand {
  constructor(
    public readonly like: any,
    public readonly newStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdateLikeCommand)
export class UpdateLikeUseCase implements ICommandHandler<UpdateLikeCommand> {
  constructor(private readonly likesRepository: LikesRepository) {}

  async execute(command: UpdateLikeCommand): Promise<void> {
    const like = await this.likesRepository.findLike(command.like.userId, command.like.parentId);
    if (!like) {
      throw NotFoundDomainException.create('Like not found');
    }
    await this.likesRepository.updateLike(like, command.newStatus);
  }
}
