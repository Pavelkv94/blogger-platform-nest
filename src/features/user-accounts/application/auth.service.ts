import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../infrastructure/users.repository';
import { BadRequestDomainException, UnauthorizedDomainException } from 'src/core/exeptions/domain-exceptions';
import { BcryptService } from './bcrypt.service';
import { UserDocument } from '../domain/user.entity';
import { LoginInputDto } from '../dto/login-user.dto';
import { UserJwtPayloadDto } from '../dto/user-jwt-payload.dto';
import { RegistrationInputDto } from '../dto/create-user.dto';
import { UsersService } from './users.service';
import { EmailService } from 'src/features/notifications/email.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject() private readonly jwtService: JwtService,
    @Inject() private readonly usersRepository: UsersRepository,
    @Inject() private readonly bcryptService: BcryptService,
    @Inject() private readonly usersService: UsersService,
    @Inject() private readonly emailService: EmailService,
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

    const passwordIsValid = await this.bcryptService.checkPassword(payload.password, user.password);
    if (!passwordIsValid) {
      throw UnauthorizedDomainException.create();
    }

    return user;
  }

  async login(userJwtPayloadDto: UserJwtPayloadDto): Promise<string> {
    const accessToken = this.jwtService.sign(userJwtPayloadDto);

    return accessToken;
  }

  async registerUser(body: RegistrationInputDto): Promise<void> {
    await this.usersRepository.loginIsExist(body.login);
    await this.usersRepository.emailIsExist(body.email);

    const userId = await this.usersService.createUser(body);

    const confirmationCode = await this.usersRepository.findConfirmationCodeByUserId(userId);

    this.emailService.sendConfirmationEmail(body.email, confirmationCode, 'activationAcc').catch(console.error);
  }

  async registrationConfirmation(code: string): Promise<void> {
    if (!code) {
      throw BadRequestDomainException.create('Code not found', 'code');
    }

    const user = await this.usersRepository.findUserByConfirmationCodeOrBadRequestFail(code);
    if (user.emailConfirmation.isConfirmed) {
      throw BadRequestDomainException.create('User already confirmed', 'code');
    }
    user.confirmRegistration();
    await user.save();
  }

  async registrationEmailResending(email: string): Promise<void> {
    const user = await this.usersRepository.findUserByEmailOrBadRequestFail(email);

    if (user.emailConfirmation.isConfirmed) {
      throw BadRequestDomainException.create('User already confirmed', 'email');
    }

    user.generateNewConfirmationCode();
    await user.save();

    const confirmationCode = user.emailConfirmation.confirmationCode;

    this.emailService.sendConfirmationEmail(email, confirmationCode, 'activationAcc').catch(console.error);
  }

  async passwordRecovery(email: string): Promise<void> {
    const user = await this.usersRepository.findUserByEmailOrBadRequestFail(email);

    user.generateNewRecoveryCode();

    await user.save();

    const recoveryCode = user.recoveryConfirmation.recoveryCode;

    this.emailService.sendConfirmationEmail(email, recoveryCode, 'passwordRecovery').catch(console.error);
  }

  async newPassword(code: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findUserByRecoveryCodeOrBadRequestFail(code);

    user.setNewPassword(newPassword);
    await user.save();
  }
}
