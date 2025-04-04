import { CreateUserDto } from '../../../dto/users/create-user.dto';
import { BadRequestDomainException } from '../../../../../core/exeptions/domain-exceptions';
import { BcryptService } from '../../bcrypt.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { User } from '../../../domain/user/user.entity';

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

    const user = User.buildInstance(command.payload.login, command.payload.email, passwordhash);

    const newUserId = await this.usersRepository.createUser(user);
    return newUserId.toString();
  }
}
