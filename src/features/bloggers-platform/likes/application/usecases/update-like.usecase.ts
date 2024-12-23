import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../dto/like-status.dto';
import { LikesRepository } from '../../infrastructure/likes.repository';
import { LikeDocument, LikeEntity, LikeModelType } from '../../domain/like.entity';
import { InjectModel } from '@nestjs/mongoose';
import { UsersRepository } from 'src/features/user-accounts/infrastructure/users/users.repository';

export class UpdateLikeCommand {
  constructor(
    public readonly like: LikeDocument,
    public readonly newStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdateLikeCommand)
export class UpdateLikeUseCase implements ICommandHandler<UpdateLikeCommand> {
  constructor(
    private readonly likesRepository: LikesRepository,
    private readonly usersRepository: UsersRepository,
    @InjectModel(LikeEntity.name) private LikeModel: LikeModelType,
  ) {}

  async execute(command: UpdateLikeCommand): Promise<void> {
    command.like.update(command.newStatus);

    await this.likesRepository.save(command.like);
  }
}
