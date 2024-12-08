import { UserDocument } from '../domain/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UserViewDto {
  @ApiProperty({ example: 'email' })
  email: string;
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;
  @ApiProperty({ example: 'login' })
  login: string;
  @ApiProperty({ example: new Date() })
  createdAt: Date;

  constructor(model: UserDocument) {
    this.id = model._id.toString();
    this.login = model.login;
    this.email = model.email;
    this.createdAt = model.createdAt;
  }

  static mapToView(user: UserDocument): UserViewDto {
    return new UserViewDto(user);
  }
}
