import { ApiProperty } from '@nestjs/swagger';
import { BlogDocument } from '../domain/blog.entity';

export class BlogViewDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;
  @ApiProperty({ example: 'Blog Name' })
  name: string;
  @ApiProperty({ example: 'Blog Description' })
  description: string;
  @ApiProperty({ example: 'https://www.example.com' })
  websiteUrl: string;
  @ApiProperty({ example: true })
  isMembership: boolean;
  @ApiProperty({ example: new Date() })
  createdAt: Date;

  constructor(model: any) {
    this.id = model.id.toString();
    this.name = model.name;
    this.description = model.description;
    this.websiteUrl = model.website_url;
    this.isMembership = model.is_membership;
    this.createdAt = model.createdAt;
  }

  static mapToView(blog: BlogDocument): BlogViewDto {
    return new BlogViewDto(blog);
  }
}
