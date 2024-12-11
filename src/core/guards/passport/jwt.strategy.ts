import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserJwtPayloadDto } from 'src/features/user-accounts/dto/user-jwt-payload.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET, //from env
    });
  }

  /**
   * функция принимает payload из jwt токена и возвращает то, что будет записано в req.user
   * @param payload
   */
  async validate(payload: UserJwtPayloadDto): Promise<UserJwtPayloadDto> {
    //! такую проверку можно делать или нет??
    // const user = await this.usersQueryRepository.findMeByIdOrNotFound(payload.userId);
    // if (!user) {
    //   throw UnauthorizedDomainException.create();
    // }
    //!========================================
    return payload;
  }
}
