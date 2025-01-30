import { ApiProperty, OmitType } from '@nestjs/swagger';
// import { UserDocument } from '../domain/user/user.entity';

export class BaseUserViewDto {
  @ApiProperty({ example: 'email' })
  email: string;
  @ApiProperty({ example: '1' })
  id: string;
  @ApiProperty({ example: 'login' })
  login: string;
  @ApiProperty({ example: new Date() })
  createdAt: Date;

  constructor(model: any) {
    this.id = model.id.toString();
    this.login = model.login;
    this.email = model.email;
    this.createdAt = model.createdAt;
  }

  static mapToView(user: any): BaseUserViewDto {
    return new BaseUserViewDto(user);
  }
}

export class UserViewDtoWithRecovery extends BaseUserViewDto {
  recoveryConfirmation: {
    confirmationCode: string;
    expirationDate: Date;
  };

  constructor(model: any) {
    super(model);
    this.recoveryConfirmation = {
      confirmationCode: model.recovery_code,
      expirationDate: model.recovery_expiration_date,
    };
  }

  static mapToView(user: any): UserViewDtoWithRecovery {
    return new UserViewDtoWithRecovery(user);
  }
}

export class UserViewDtoWithConfirmation extends BaseUserViewDto {
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  };

  constructor(model: any) {
    super(model);
    this.emailConfirmation = {
      confirmationCode: model.confirmation_code,
      expirationDate: model.expiration_date,
      isConfirmed: model.is_confirmed,
    };
  }

  static mapToView(user: any): UserViewDtoWithConfirmation {
    return new UserViewDtoWithConfirmation(user);
  }
}

export class FullUserViewDto extends BaseUserViewDto {
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  };
  recoveryConfirmation: {
    confirmationCode: string;
    expirationDate: Date;
  };

  constructor(model: any) {
    super(model);
    this.emailConfirmation = {
      confirmationCode: model.confirmation_code,
      expirationDate: model.expiration_date,
      isConfirmed: model.is_confirmed,
    };
    this.recoveryConfirmation = {
      confirmationCode: model.recovery_code,
      expirationDate: model.recovery_expiration_date,
    };
  }

  static mapToView(user: any): FullUserViewDto {
    return new FullUserViewDto(user);
  }
}

export class MeViewDto extends OmitType(BaseUserViewDto, ['createdAt', 'id'] as const) {
  userId: string;

  static mapToView(user: any): MeViewDto {
    const dto = new MeViewDto();

    dto.email = user.email;
    dto.login = user.login;
    dto.userId = user.id.toString();

    return dto;
  }
}
