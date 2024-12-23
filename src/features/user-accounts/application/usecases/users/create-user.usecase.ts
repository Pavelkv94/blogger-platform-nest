import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from '../../../dto/create-user.dto';
import { BadRequestDomainException } from 'src/core/exeptions/domain-exceptions';
import { BcryptService } from '../../bcrypt.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserEntity, UserModelType } from 'src/features/user-accounts/domain/user/user.entity';
import { UsersRepository } from 'src/features/user-accounts/infrastructure/users/users.repository';

export class CreateUserCommand {
  constructor(public readonly payload: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly bcryptService: BcryptService,
    @InjectModel(UserEntity.name) private UserModel: UserModelType,
  ) {}

  async execute(command: CreateUserCommand): Promise<string> {
    const loginIsExist = await this.usersRepository.findUserByLogin(command.payload.login);
    if (loginIsExist) {
      throw BadRequestDomainException.create('Login already exists', 'login');
    }

    const user = await this.usersRepository.findUserByEmail(command.payload.email);

    if (user) {
      throw BadRequestDomainException.create('Email already exists', 'email');
    }

    const passwordhash = await this.bcryptService.generateHash(command.payload.password);
    const newUser = this.UserModel.buildInstance(command.payload.login, command.payload.email, passwordhash);

    await this.usersRepository.save(newUser);

    return newUser._id.toString();
  }
}
