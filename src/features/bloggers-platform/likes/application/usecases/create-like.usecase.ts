import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { LikeStatus } from '../../dto/like-status.dto';
import { LikesRepository } from '../../infrastructure/likes.repository';
import { LikeEntity, LikeModelType } from '../../domain/like.entity';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { UsersRepository } from 'src/features/user-accounts/infrastructure/users/users.repository';

export class CreateLikeCommand {
  constructor(
    public readonly userId: string,
    public readonly parent_id: string,
    public readonly newStatus: LikeStatus,
  ) {}
}

@CommandHandler(CreateLikeCommand)
export class CreateLikeUseCase implements ICommandHandler<CreateLikeCommand> {
  constructor(
    private readonly likesRepository: LikesRepository,
    private readonly usersRepository: UsersRepository,
    @InjectModel(LikeEntity.name) private LikeModel: LikeModelType,
  ) {}

  async execute(command: CreateLikeCommand): Promise<void> {
    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) {
      throw NotFoundDomainException.create('User not found');
    }

    const newLike = this.LikeModel.buildInstance(user, command.parent_id, command.newStatus);

    await this.likesRepository.save(newLike);
  }
}
