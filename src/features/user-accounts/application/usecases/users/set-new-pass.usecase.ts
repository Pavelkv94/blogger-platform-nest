import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestDomainException } from 'src/core/exeptions/domain-exceptions';
import { UsersRepository } from 'src/features/user-accounts/infrastructure/users/users.repository';

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
    const user = await this.usersRepository.findUserByRecoveryCode(command.code);

    if (!user) {
      throw BadRequestDomainException.create('Code not found', 'code');
    }

    user.setNewPassword(command.newPassword);
    await user.save();
  }
}
