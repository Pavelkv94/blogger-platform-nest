import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../../infrastructure/auth/auth.repository';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { BadRequestDomainException } from '../../../../../core/exeptions/domain-exceptions';

export class SetNewPassCommand {
  constructor(
    public readonly code: string,
    public readonly newPassword: string,
  ) {}
}

@CommandHandler(SetNewPassCommand)
export class SetNewPassUseCase implements ICommandHandler<SetNewPassCommand> {
  constructor(
    @Inject() private readonly usersRepository: UsersRepository,
    @Inject() private readonly authRepository: AuthRepository,
  ) {}

  async execute(command: SetNewPassCommand): Promise<void> {
    const user = await this.usersRepository.findUserByRecoveryCode(command.code);

    if (!user) {
      throw BadRequestDomainException.create('Code not found', 'code');
    }

    await this.authRepository.setNewPassword(user.id, command.newPassword);
  }
}
