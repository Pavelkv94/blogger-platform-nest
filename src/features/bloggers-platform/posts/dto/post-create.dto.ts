import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { contentConstraints, shortDescriptionConstraints, titleConstraints } from '../domain/post.entity';

export class CreatePostForBlogDto {
  @ApiProperty({ example: 'Post title', description: 'Title of the post' })
  @IsString()
  @Length(titleConstraints.minLength, titleConstraints.maxLength  )
  title: string;

  @ApiProperty({ example: 'Short description', description: 'Short description of the post' })
  @IsString()
  @Length(shortDescriptionConstraints.minLength, shortDescriptionConstraints.maxLength)
  shortDescription: string;

  @ApiProperty({ example: 'Content', description: 'Content of the post' })
  @IsString()
  @Length(contentConstraints.minLength, contentConstraints.maxLength)
  content: string;
}

export class CreatePostDto extends CreatePostForBlogDto {
  @ApiProperty({ example: 'Blog ID', description: 'ID of the blog' })
  @IsString()
  blogId: string;
}
