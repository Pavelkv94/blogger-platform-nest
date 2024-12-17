import { UserModelType } from '../../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UserEntity } from '../../domain/user.entity';
import { BadRequestDomainException } from 'src/core/exeptions/domain-exceptions';
import { BcryptService } from '../bcrypt.service';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

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

    const emailIsExist = await this.usersRepository.findUserByEmail(command.payload.email);
    if (emailIsExist) {
      throw BadRequestDomainException.create('Email already exists', 'email');
    }

    const passwordhash = await this.bcryptService.generateHash(command.payload.password);
    const newUser = this.UserModel.buildInstance(command.payload.login, command.payload.email, passwordhash);

    await this.usersRepository.save(newUser);

    return newUser._id.toString();
  }
}
