import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from 'src/features/user-accounts/infrastructure/users/users.repository';

export class DeleteUserCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const user = await this.usersRepository.findUserById(command.id);
    if (!user) {
      throw NotFoundDomainException.create('User not found');
    }

    await this.usersRepository.deleteUser(command.id);
    // await user.markDeleted();
    // await this.usersRepository.save(user);
  }
}
