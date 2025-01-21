import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestDomainException } from 'src/core/exeptions/domain-exceptions';
import { AuthRepository } from 'src/features/user-accounts/infrastructure/auth/auth.repository';
import { UsersRepository } from 'src/features/user-accounts/infrastructure/users/users.repository';

export class RegisterConfirmCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(RegisterConfirmCommand)
export class RegisterConfirmUseCase implements ICommandHandler<RegisterConfirmCommand> {
  constructor(
    @Inject() private readonly usersRepository: UsersRepository,
    @Inject() private readonly authRepository: AuthRepository,
  ) {}

  async execute(command: RegisterConfirmCommand): Promise<void> {
    if (!command.code) {
      throw BadRequestDomainException.create('Code not found', 'code');
    }

    const user = await this.usersRepository.findUserByConfirmationCode(command.code);

    if (!user) {
      throw BadRequestDomainException.create('Code doesnt exist', 'code');
    }

    if (user.emailConfirmation.isConfirmed) {
      throw BadRequestDomainException.create('User already confirmed', 'code');
    }
    await this.authRepository.confirmRegistration(user.id);
  }
}
