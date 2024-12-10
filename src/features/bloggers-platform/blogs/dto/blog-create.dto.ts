import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';
import { IsUrl } from 'class-validator';
import { IsString } from 'class-validator';
import { descriptionConstraints, websiteUrlConstraints } from '../domain/blog.entity';
import { nameConstraints } from '../domain/blog.entity';

export class BlogCreateDto {
  @ApiProperty({ example: 'Blog Name' })
  @IsString()
  @Length(nameConstraints.minLength, nameConstraints.maxLength)
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
