import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailService } from 'src/features/notifications/email.service';
import { BadRequestDomainException } from 'src/core/exeptions/domain-exceptions';
import { UsersRepository } from 'src/features/user-accounts/infrastructure/users/users.repository';

export class ResendEmailCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(ResendEmailCommand)
export class ResendEmailUseCase implements ICommandHandler<ResendEmailCommand> {
  constructor(
    @Inject() private readonly usersRepository: UsersRepository,
    @Inject() private readonly emailService: EmailService,
  ) {}

  async execute(command: ResendEmailCommand): Promise<void> {
    const user = await this.usersRepository.findUserByEmail(command.email);

    if(!user) {
      throw BadRequestDomainException.create('User doesnt exist', 'email');
    }
    
    if (user.emailConfirmation.isConfirmed) {
      throw BadRequestDomainException.create('User already confirmed', 'email');
    }

    user.generateNewConfirmationCode();
    await user.save();

    const confirmationCode = user.emailConfirmation.confirmationCode;

    this.emailService.sendConfirmationEmail(command.email, confirmationCode, 'activationAcc').catch(console.error);
  }
}
