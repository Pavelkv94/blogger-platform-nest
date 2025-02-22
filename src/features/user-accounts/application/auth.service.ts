import { Inject, Injectable } from '@nestjs/common';
import { UnauthorizedDomainException } from '../../../core/exeptions/domain-exceptions';
import { BcryptService } from './bcrypt.service';
import { LoginInputDto } from '../dto/users/login-user.dto';
import {} from '../dto/users/create-user.dto';
import { UsersRepository } from '../infrastructure/users/users.repository';

@Injectable()
export class AuthService {
  constructor(
    @Inject() private readonly usersRepository: UsersRepository,
    @Inject() private readonly bcryptService: BcryptService,
  ) {}

  //* вспомогательный(утилитарный) метод а не основной(команда)
  async validateUser(payload: LoginInputDto): Promise<any> {
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
