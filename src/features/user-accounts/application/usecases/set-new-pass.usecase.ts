import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';

export class SetNewPassCommand {
  constructor(
    public readonly code: string,
    public readonly newPassword: string,
  ) {}
}

@CommandHandler(SetNewPassCommand)
export class SetNewPassUseCase implements ICommandHandler<SetNewPassCommand> {
  constructor(@Inject() private readonly usersRepository: UsersRepository) {}

  async execute(command: SetNewPassCommand): Promise<void> {
    const user = await this.usersRepository.findUserByRecoveryCodeOrBadRequestFail(command.code);

    user.setNewPassword(command.newPassword);
    await user.save();
  }
}
