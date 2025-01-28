import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../dto/like-status.dto';
import { LikesRepository } from '../../infrastructure/likes.repository';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { UsersRepository } from 'src/features/user-accounts/infrastructure/users/users.repository';
import { LikeParent } from '../../dto/like-parent.dto';

export class CreateLikeCommand {
  constructor(
    public readonly userId: string,
    public readonly parent_id: string,
    public readonly newStatus: LikeStatus,
    public readonly parentType: LikeParent,
  ) {}
}

@CommandHandler(CreateLikeCommand)
export class CreateLikeUseCase implements ICommandHandler<CreateLikeCommand> {
  constructor(
    private readonly likesRepository: LikesRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: CreateLikeCommand): Promise<void> {
    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) {
      throw NotFoundDomainException.create('User not found');
    }

    await this.likesRepository.createLike(command.parent_id, command.userId, command.newStatus, command.parentType);
  }
}
