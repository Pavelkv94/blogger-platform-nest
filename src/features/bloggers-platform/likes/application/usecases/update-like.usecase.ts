import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../dto/like-status.dto';
import { LikesRepository } from '../../infrastructure/likes.repository';
import { LikeDocument } from '../../domain/like.entity';

export class UpdateLikeCommand {
  constructor(
    public readonly like: LikeDocument,
    public readonly newStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdateLikeCommand)
export class UpdateLikeUseCase implements ICommandHandler<UpdateLikeCommand> {
  constructor(private readonly likesRepository: LikesRepository) {}

  async execute(command: UpdateLikeCommand): Promise<void> {
    await this.likesRepository.updateLike(command.like.id, command.newStatus);
  }
}
