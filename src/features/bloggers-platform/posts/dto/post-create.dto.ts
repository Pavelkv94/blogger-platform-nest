import { ApiProperty } from '@nestjs/swagger';

export class CreatePostForBlogDto {
  @ApiProperty({ example: 'Post title', description: 'Title of the post' })
  title: string;

  @ApiProperty({ example: 'Short description', description: 'Short description of the post' })
  shortDescription: string;

  @ApiProperty({ example: 'Content', description: 'Content of the post' })
  content: string;
}

export class CreatePostDto extends CreatePostForBlogDto {
  @ApiProperty({ example: 'Blog ID', description: 'ID of the blog' })
  blogId: string;
}
