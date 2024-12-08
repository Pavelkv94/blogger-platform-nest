import { ApiProperty } from '@nestjs/swagger';

export class BlogCreateDto {
  @ApiProperty({ example: 'Blog Name' })
  name: string;
  @ApiProperty({ example: 'Blog Description' })
  description: string;
  @ApiProperty({ example: 'https://www.example.com' })
  websiteUrl: string;
  @ApiProperty({ example: true })
  isMembership: boolean;
}
