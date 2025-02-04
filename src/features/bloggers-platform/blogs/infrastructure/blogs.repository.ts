import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { BlogCreateDto } from '../dto/blog-create.dto';
import { BlogUpdateDto } from '../dto/blog-update.dto';
import { Blog } from '../domain/blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(@InjectRepository(Blog) private blogRepositoryTypeOrm: Repository<Blog>) {}

  async findBlogById(id: string): Promise<Blog | null> {
    const blog = await this.blogRepositoryTypeOrm.findOne({ where: { id: Number(id), deletedAt: IsNull() } });
    if (!blog) {
      return null;
    }
    return blog;
  }

  async createBlog(payload: BlogCreateDto): Promise<string> {
    const blog = Blog.buildInstance(payload.name, payload.description, payload.websiteUrl);
    const newBlog = await this.blogRepositoryTypeOrm.save(blog);
    return newBlog.id.toString();
  }

  async updateBlog(blog: Blog, payload: BlogUpdateDto): Promise<void> {
    blog.update(payload.name, payload.description, payload.websiteUrl);
    await this.blogRepositoryTypeOrm.save(blog);
  }

  async deleteBlog(blog: Blog): Promise<void> {
    blog.markDeleted();
    await this.blogRepositoryTypeOrm.save(blog);
  }
}
