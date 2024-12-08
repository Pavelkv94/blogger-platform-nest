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

  constructor(model: BlogDocument) {
    this.id = model._id.toString();
    this.name = model.name;
    this.description = model.description;
    this.websiteUrl = model.websiteUrl;
    this.isMembership = model.isMembership;
    this.createdAt = model.createdAt;
  }

  static mapToView(blog: BlogDocument): BlogViewDto {
    return new BlogViewDto(blog);
  }
}
