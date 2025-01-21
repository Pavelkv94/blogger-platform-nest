import { Injectable } from '@nestjs/common';
import { CreatePostDto } from '../dto/post-create.dto';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { UpdateBlogPostDto, UpdatePostDto } from '../dto/post-update.dto';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findPostById(id: string): Promise<any | null> {
    const query = `SELECT * FROM posts WHERE id = $1 AND deleted_at IS NULL`;
    const post = await this.dataSource.query(query, [id]);
    if (!post) {
      return null;
    }
    return post[0];
  }

  async save(post: any): Promise<void> {
    // await post.save();
  }

  async createPost(payload: CreatePostDto): Promise<string> {
    const query = `INSERT INTO posts (title, short_description, content, blog_id) VALUES ($1, $2, $3, $4) RETURNING id`;
    const newPost = await this.dataSource.query(query, [payload.title, payload.shortDescription, payload.content, payload.blogId]);
    return newPost[0].id;
  }

  async updatePost(id: string, payload: UpdatePostDto | UpdateBlogPostDto): Promise<void> {
    const query = `UPDATE posts SET title = $1, short_description = $2, content = $3 WHERE id = $4`;
    await this.dataSource.query(query, [payload.title, payload.shortDescription, payload.content, id]);
  }

  async deletePost(id: string): Promise<void> {
    const query = `UPDATE posts SET deleted_at = NOW() WHERE id = $1`;
    await this.dataSource.query(query, [id]);
  }
}
