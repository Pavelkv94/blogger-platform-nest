import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogCreateDto } from '../dto/blog-create.dto';
import { BlogUpdateDto } from '../dto/blog-update.dto';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findBlogById(id: string): Promise<any | null> {
    const query = `SELECT * FROM blogs WHERE id = $1 AND deleted_at IS NULL`;
    const blog = await this.dataSource.query(query, [id]);
    if (!blog) {
      return null;
    }
    return blog[0];
  }

  async createBlog(payload: BlogCreateDto): Promise<string> {
    const query = `INSERT INTO blogs (name, description, website_url) VALUES ($1, $2, $3) RETURNING id`;
    const newBlog = await this.dataSource.query(query, [payload.name, payload.description, payload.websiteUrl]);
    return newBlog[0].id;
  }

  async updateBlog(id: string, payload: BlogUpdateDto): Promise<void> {
    const query = `UPDATE blogs SET name = $1, description = $2, website_url = $3 WHERE id = $4`;
    await this.dataSource.query(query, [payload.name, payload.description, payload.websiteUrl, id]);
  }

  async deleteBlog(id: string): Promise<void> {
    const query = `UPDATE blogs SET deleted_at = NOW() WHERE id = $1`;
    await this.dataSource.query(query, [id]);
  }
}
