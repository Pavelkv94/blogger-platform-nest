import { CreateUserDto } from '../../../dto/create-user.dto';
import { BadRequestDomainException } from 'src/core/exeptions/domain-exceptions';
import { BcryptService } from '../../bcrypt.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from 'src/features/user-accounts/infrastructure/users/users.repository';

export class CreateUserCommand {
  constructor(public readonly payload: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute(command: CreateUserCommand): Promise<string> {
    const loginIsExist = await this.usersRepository.findUserByLogin(command.payload.login);
    if (loginIsExist) {
      throw BadRequestDomainException.create('Login already exists', 'login');
    }

    const emailIsExist = await this.usersRepository.findUserByEmail(command.payload.email);

    if (emailIsExist) {
      throw BadRequestDomainException.create('Email already exists', 'email');
    }

    const passwordhash = await this.bcryptService.generateHash(command.payload.password);
    const newUserId = await this.usersRepository.createUser(command.payload.login, command.payload.email, passwordhash);

    return newUserId;
  }
}
