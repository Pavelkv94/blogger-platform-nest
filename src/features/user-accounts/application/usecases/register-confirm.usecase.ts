import { Inject } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestDomainException } from 'src/core/exeptions/domain-exceptions';
import { EmailService } from 'src/features/notifications/email.service';
import { UsersRepository } from '../../infrastructure/users.repository';

export class RegisterConfirmCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(RegisterConfirmCommand)
export class RegisterConfirmUseCase implements ICommandHandler<RegisterConfirmCommand> {
  constructor(
    @Inject() private readonly usersRepository: UsersRepository,
    @Inject() private readonly emailService: EmailService,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: RegisterConfirmCommand): Promise<void> {
    if (!command.code) {
      throw BadRequestDomainException.create('Code not found', 'code');
    }

    const user = await this.usersRepository.findUserByConfirmationCodeOrBadRequestFail(command.code);
    if (user.emailConfirmation.isConfirmed) {
      throw BadRequestDomainException.create('User already confirmed', 'code');
    }
    user.confirmRegistration();
    await user.save();
  }
}
