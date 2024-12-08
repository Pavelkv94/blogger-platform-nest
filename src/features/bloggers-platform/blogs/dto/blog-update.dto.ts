import { ApiProperty } from '@nestjs/swagger';

export class BlogUpdateDto {
  @ApiProperty({ example: 'Blog Name' })
  name: string;
  @ApiProperty({ example: 'Blog Description' })
  description: string;
  @ApiProperty({ example: 'https://www.example.com' })
  websiteUrl: string;
}
