import { UsersRepository } from '../../infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteUserCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const user = await this.usersRepository.findByIdOrNotFoundFail(command.id);

    user.makeDeleted();

    await this.usersRepository.save(user);
  }
}
