import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailService } from '../../../../../features/notifications/email.service';
import { BadRequestDomainException } from '../../../../../core/exeptions/domain-exceptions';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { AuthRepository } from '../../../infrastructure/auth/auth.repository';

export class ResendEmailCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(ResendEmailCommand)
export class ResendEmailUseCase implements ICommandHandler<ResendEmailCommand> {
  constructor(
    @Inject() private readonly usersRepository: UsersRepository,
    @Inject() private readonly authRepository: AuthRepository,
    @Inject() private readonly emailService: EmailService,
  ) {}

  async execute(command: ResendEmailCommand): Promise<void> {
    const user = await this.usersRepository.findUserByEmailWithConfirmation(command.email);

    if (!user) {
      throw BadRequestDomainException.create('User doesnt exist', 'email');
    }

    if (user.emailConfirmation.isConfirmed) {
      throw BadRequestDomainException.create('User already confirmed', 'email');
    }

    const newConfirmationCode = await this.authRepository.generateNewConfirmationCode(user.id);
   
    this.emailService.sendConfirmationEmail(command.email, newConfirmationCode, 'activationAcc').catch(console.error);
  }
}
