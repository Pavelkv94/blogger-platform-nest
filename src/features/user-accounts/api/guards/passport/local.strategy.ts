import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../../application/auth.service';
import { UnauthorizedDomainException } from '../../../../../core/exeptions/domain-exceptions';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    //поле в теле запроса, которое будет использоваться для валидации
    super({ usernameField: 'loginOrEmail' });
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser({ loginOrEmail: username, password });
    if (!user) {
      throw UnauthorizedDomainException.create();
    }

    return user;
  }
}
