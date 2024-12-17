import { Inject, Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { UnauthorizedDomainException } from 'src/core/exeptions/domain-exceptions';
import { BcryptService } from './bcrypt.service';
import { UserDocument } from '../domain/user.entity';
import { LoginInputDto } from '../dto/login-user.dto';
import {  } from '../dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
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

    const passwordIsValid = await this.bcryptService.checkPassword(payload.password, user.password);
    if (!passwordIsValid) {
      throw UnauthorizedDomainException.create();
    }

    return user;
  }

  // async login(userJwtPayloadDto: UserJwtPayloadDto): Promise<string> {
  //   const accessToken = this.jwtService.sign(userJwtPayloadDto);

  //   return accessToken;
  // }

  // async registerUser(body: RegistrationInputDto): Promise<void> {
  //   const loginIsExist = await this.usersRepository.findUserByLogin(body.login);
  //   if (loginIsExist) {
  //     throw BadRequestDomainException.create('Login already exists', 'login');
  //   }

  //   const emailIsExist = await this.usersRepository.findUserByEmail(body.email);
  //   if (emailIsExist) {
  //     throw BadRequestDomainException.create('Email already exists', 'email');
  //   }

  //   const userId = await this.usersService.createUser(body);

  //   const confirmationCode = await this.usersRepository.findConfirmationCodeByUserId(userId);

  //   this.emailService.sendConfirmationEmail(body.email, confirmationCode, 'activationAcc').catch(console.error);
  // }

  // async registrationConfirmation(code: string): Promise<void> {
  //   if (!code) {
  //     throw BadRequestDomainException.create('Code not found', 'code');
  //   }

  //   const user = await this.usersRepository.findUserByConfirmationCodeOrBadRequestFail(code);
  //   if (user.emailConfirmation.isConfirmed) {
  //     throw BadRequestDomainException.create('User already confirmed', 'code');
  //   }
  //   user.confirmRegistration();
  //   await user.save();
  // }

  // async registrationEmailResending(email: string): Promise<void> {
  //   const user = await this.usersRepository.findUserByEmailOrBadRequestFail(email);

  //   if (user.emailConfirmation.isConfirmed) {
  //     throw BadRequestDomainException.create('User already confirmed', 'email');
  //   }

  //   user.generateNewConfirmationCode();
  //   await user.save();

  //   const confirmationCode = user.emailConfirmation.confirmationCode;

  //   this.emailService.sendConfirmationEmail(email, confirmationCode, 'activationAcc').catch(console.error);
  // }

  // async passwordRecovery(email: string): Promise<void> {
  //   const user = await this.usersRepository.findUserByEmailOrBadRequestFail(email);

  //   user.generateNewRecoveryCode();

  //   await user.save();

  //   const recoveryCode = user.recoveryConfirmation.recoveryCode;

  //   this.emailService.sendConfirmationEmail(email, recoveryCode, 'passwordRecovery').catch(console.error);
  // }

  // async newPassword(code: string, newPassword: string): Promise<void> {
  //   const user = await this.usersRepository.findUserByRecoveryCodeOrBadRequestFail(code);

  //   user.setNewPassword(newPassword);
  //   await user.save();
  // }
}
