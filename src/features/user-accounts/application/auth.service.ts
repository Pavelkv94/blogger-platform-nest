import { Inject, Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { UnauthorizedDomainException } from 'src/core/exeptions/domain-exceptions';
import { BcryptService } from './bcrypt.service';
import { UserDocument } from '../domain/user.entity';
import { LoginInputDto } from '../dto/login-user.dto';
import {} from '../dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject() private readonly usersRepository: UsersRepository,
    @Inject() private readonly bcryptService: BcryptService,
  ) {}

  //* вспомогательный(утилитарный) метод а не основной(команда)
  async validateUser(payload: LoginInputDto): Promise<UserDocument> {
    const user = await this.usersRepository.findUserByLoginOrEmail(payload.loginOrEmail);
    if (!user) {
      throw UnauthorizedDomainException.create();
    }

    const passwordIsValid = await this.bcryptService.checkPassword(payload.password, user.password);
    if (!passwordIsValid) {
      throw UnauthorizedDomainException.create();
    }

    return user;
  }
}
//! event bus рассмотреть
