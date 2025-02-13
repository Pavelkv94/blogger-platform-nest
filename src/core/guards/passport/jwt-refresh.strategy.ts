import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersRepository } from '../../../features/user-accounts/infrastructure/users/users.repository';
import { CoreConfig } from '../../core.config';
import { UnauthorizedDomainException } from '../../exeptions/domain-exceptions';
import { SecurityDevicesRepository } from '../../../features/user-accounts/infrastructure/security-devices/security-devices.repository';
import { UserJwtPayloadDto } from '../../../features/user-accounts/dto/users/user-jwt-payload.dto';

@Injectable()
export class JwtRefreshAuthPassportStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    @Inject() private readonly usersRepository: UsersRepository,
    @Inject() private readonly securityDevicesRepository: SecurityDevicesRepository,
    public readonly coreConfig: CoreConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          // Extract the JWT from the cookie
          return req.cookies?.refreshToken; // Ensure that the cookie name matches what you set
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: coreConfig.refreshTokenSecret,
    });
  }

  async validate(payload: UserJwtPayloadDto) {
    console.log("Starting validation process"); // Add this log

    const user = await this.usersRepository.findUserById(payload.userId);
    if (!user) {
      throw UnauthorizedDomainException.create();
    }

    const device = await this.securityDevicesRepository.findDeviceByToken(payload);

    if (!device) {
      throw UnauthorizedDomainException.create();
    }

    return payload;
  }
}
