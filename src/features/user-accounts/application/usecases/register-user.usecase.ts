import { Inject } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegistrationInputDto } from '../../dto/users/create-user.dto';
import { BadRequestDomainException, NotFoundDomainException } from '../../../../core/exeptions/domain-exceptions';
import { EmailService } from '../../../notifications/email.service';
import { CreateUserCommand } from './users/create-user.usecase';
import { UsersRepository } from '../../infrastructure/users/users.repository';

export class RegisterUserCommand {
  constructor(public readonly payload: RegistrationInputDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @Inject() private readonly usersRepository: UsersRepository,
    @Inject() private readonly emailService: EmailService,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: RegisterUserCommand): Promise<void> {
    const loginIsExist = await this.usersRepository.findUserByLogin(command.payload.login);
    if (loginIsExist) {
      throw BadRequestDomainException.create('Login already exists', 'login');
    }

    const emailIsExist = await this.usersRepository.findUserByEmail(command.payload.email);
    if (emailIsExist) {
      throw BadRequestDomainException.create('Email already exists', 'email');
    }

    const userId = await this.commandBus.execute<CreateUserCommand, string>(new CreateUserCommand(command.payload));

    const user = await this.usersRepository.findUserById(userId);

    if (!user) {
      throw NotFoundDomainException.create('Post not found');
    }

    this.emailService.sendConfirmationEmail(command.payload.email, user.emailConfirmation.confirmationCode, 'activationAcc').catch(console.error);
  }
}
