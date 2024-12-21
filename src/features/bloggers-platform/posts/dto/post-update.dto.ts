import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';
import { IsNotEmptyString } from 'src/core/decorators/validation/IsNotEmptyString';
import { BlogIsNotExist } from '../api/validation/blogIsExist.decorator';

export class UpdatePostDto {
  @ApiProperty({ example: 'Post title', description: 'Title of the post' })
  @IsNotEmptyString()
  @Length(1, 30)
  title: string;
  @ApiProperty({ example: 'Short description', description: 'Short description of the post' })
  @IsNotEmptyString()
  @Length(1, 100)
  shortDescription: string;
  @ApiProperty({ example: 'Content', description: 'Content of the post' })
  @IsNotEmptyString()
  @Length(1, 1000)
  content: string;
  @ApiProperty({ example: 'Blog ID', description: 'ID of the blog' })
  @IsNotEmptyString()
  @BlogIsNotExist()  
  blogId: string;
}
