import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../infrastructure/users.repository';
import { UnauthorizedDomainException } from 'src/core/exeptions/domain-exceptions';
import { BcryptService } from './bcrypt.service';
import { UserDocument } from '../domain/user.entity';
import { LoginInputDto } from '../dto/login-user.dto';
import { UserJwtPayloadDto } from '../dto/user-jwt-payload.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject() private readonly jwtService: JwtService,
    @Inject() private readonly usersRepository: UsersRepository,
    @Inject() private readonly bcryptService: BcryptService,
  ) {
    // private readonly usersRepository: UsersRepository,
    // @Inject() private readonly bcryptService: BcryptService,
    // @InjectModel(UserEntity.name) private UserModel: UserModelType,
  }

  async validateUser(payload: LoginInputDto): Promise<UserDocument> {
    const user = await this.usersRepository.findUserByLoginOrEmail(payload.loginOrEmail);
    if (!user) {
      throw UnauthorizedDomainException.create();
    }

    const psswordIsValid = await this.bcryptService.checkPassword(payload.password, user.password);
    if (!psswordIsValid) {
      throw UnauthorizedDomainException.create();
    }

    return user;
  }

  async login(userJwtPayloadDto: UserJwtPayloadDto): Promise<string> {
    const accessToken = this.jwtService.sign(userJwtPayloadDto);

    return accessToken;
  }
}
