import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/posts.repository';
import { CreatePostDto } from '../dto/post-create.dto';
import { UpdatePostDto } from '../dto/post-update.dto';
import { PostEntity } from '../domain/post.entity';
import { BlogsService } from '../../blogs/application/blogs.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsService: BlogsService,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<string> {
    const blog = await this.blogsService.findById(createPostDto.blogId);
    const newPost = PostEntity.buildInstance(createPostDto, blog.name);
    await this.postsRepository.save(newPost);

    return newPost._id.toString();
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<void> {
    const post = await this.postsRepository.findOrNotFoundFail(id);

    post.update(updatePostDto);

    await this.postsRepository.save(post);
  }

  async delete(id: string): Promise<void> {
    const post = await this.postsRepository.findOrNotFoundFail(id);

    post.makeDeleted();

    await this.postsRepository.save(post);
  }
}
