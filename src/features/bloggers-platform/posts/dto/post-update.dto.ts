import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpdatePostDto {
  @ApiProperty({ example: 'Post title', description: 'Title of the post' })
  @IsString()
  @Length(0, 30)
  title: string;
  @ApiProperty({ example: 'Short description', description: 'Short description of the post' })
  @IsString()
  @Length(0, 100)
  shortDescription: string;
  @ApiProperty({ example: 'Content', description: 'Content of the post' })
  @IsString()
  @Length(0, 1000)
  content: string;
  @ApiProperty({ example: 'Blog ID', description: 'ID of the blog' })
  @IsString()
  blogId: string;
}
