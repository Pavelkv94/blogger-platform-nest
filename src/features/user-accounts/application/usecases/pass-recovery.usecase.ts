import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailService } from 'src/features/notifications/email.service';
import { UsersRepository } from '../../infrastructure/users.repository';
import { BadRequestDomainException } from 'src/core/exeptions/domain-exceptions';

export class PassRecoveryCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(PassRecoveryCommand)
export class PassRecoveryUseCase implements ICommandHandler<PassRecoveryCommand> {
  constructor(
    @Inject() private readonly usersRepository: UsersRepository,
    @Inject() private readonly emailService: EmailService,
  ) {}

  async execute(command: PassRecoveryCommand): Promise<void> {
    const user = await this.usersRepository.findUserByEmail(command.email);

    if(!user) {
      throw BadRequestDomainException.create('User doesnt exist', 'email');
    }
    user.generateNewRecoveryCode();

    await user.save();

    const recoveryCode = user.recoveryConfirmation.recoveryCode;

    this.emailService.sendConfirmationEmail(command.email, recoveryCode, 'passwordRecovery').catch(console.error);
  }
}
