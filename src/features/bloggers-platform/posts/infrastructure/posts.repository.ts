import { Injectable } from '@nestjs/common';
import { CreatePostDto } from '../dto/post-create.dto';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateBlogPostDto, UpdatePostDto } from '../dto/post-update.dto';
import { Post } from '../domain/post.entity';

@Injectable()
export class PostsRepository {
  constructor(@InjectRepository(Post) private postRepositoryTypeOrm: Repository<Post>) {}

  async findPostById(id: string): Promise<any | null> {
    const post = await this.postRepositoryTypeOrm.findOne({ where: { id: Number(id), deletedAt: IsNull() } });
    if (!post) {
      return null;
    }
    return post;
  }

  async createPost(payload: CreatePostDto): Promise<string> {
    const post = Post.buildInstance(payload);
    const newPost = await this.postRepositoryTypeOrm.save(post);
    return newPost.id.toString();
  }

  async updatePost(post: Post, payload: UpdatePostDto | UpdateBlogPostDto): Promise<void> {
    post.update(payload);
    await this.postRepositoryTypeOrm.save(post);
  }

  async deletePost(post: Post): Promise<void> {
    post.makeDeleted();
    await this.postRepositoryTypeOrm.save(post);
  }
}
