import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';
import { IsString } from 'class-validator';
import { Length } from 'class-validator';
import { nameConstraints } from '../domain/blog.entity';
import { descriptionConstraints, websiteUrlConstraints } from '../domain/blog.entity';
import { IsNotEmptyString } from '../../../../core/decorators/validation/IsNotEmptyString';

export class BlogUpdateDto {
  @ApiProperty({ example: 'Blog Name' })
  @IsNotEmptyString()
  @Length(nameConstraints.minLength,  nameConstraints.maxLength)
  name: string;
  @ApiProperty({ example: 'Blog Description' })
  @IsString()
  @Length(descriptionConstraints.minLength, descriptionConstraints.maxLength)
  description: string;
  @ApiProperty({ example: 'https://www.example.com' })
  @IsString()
  @Length(websiteUrlConstraints.minLength, websiteUrlConstraints.maxLength)
  @IsUrl()
  websiteUrl: string;
}
