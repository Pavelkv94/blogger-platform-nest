import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailService } from 'src/features/notifications/email.service';
import { BadRequestDomainException } from 'src/core/exeptions/domain-exceptions';
import { UsersRepository } from 'src/features/user-accounts/infrastructure/users/users.repository';
import { AuthRepository } from 'src/features/user-accounts/infrastructure/auth/auth.repository';

export class PassRecoveryCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(PassRecoveryCommand)
export class PassRecoveryUseCase implements ICommandHandler<PassRecoveryCommand> {
  constructor(
    @Inject() private readonly usersRepository: UsersRepository,
    @Inject() private readonly authRepository: AuthRepository,
    @Inject() private readonly emailService: EmailService,
  ) {}

  async execute(command: PassRecoveryCommand): Promise<void> {
    const user = await this.usersRepository.findUserByEmail(command.email);

    if (!user) {
      throw BadRequestDomainException.create('User doesnt exist', 'email');
    }
    const newRecoveryCode = await this.authRepository.generateNewRecoveryCode(user.id);

    this.emailService.sendConfirmationEmail(command.email, newRecoveryCode, 'passwordRecovery').catch(console.error);
  }
}
