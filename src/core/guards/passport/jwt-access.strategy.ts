import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserJwtPayloadDto } from 'src/features/user-accounts/dto/users/user-jwt-payload.dto';
import { UsersRepository } from 'src/features/user-accounts/infrastructure/users/users.repository';
import { UnauthorizedDomainException } from 'src/core/exeptions/domain-exceptions';
import { CoreConfig } from 'src/core/core.config';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, "jwt-access") {
  constructor(
    @Inject() private readonly usersRepository: UsersRepository,
    private readonly coreConfig: CoreConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: coreConfig.accessTokenSecret, //from env
    });
  }

  /**
   * функция принимает payload из jwt токена и возвращает то, что будет записано в req.user
   * @param payload
   */
  async validate(payload: UserJwtPayloadDto): Promise<UserJwtPayloadDto> {
    const user = await this.usersRepository.findUserById(payload.userId);
    if (!user) {
      throw UnauthorizedDomainException.create();
    }
    return payload;
  }
}
