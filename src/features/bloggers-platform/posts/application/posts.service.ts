import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostsRepository } from '../infrastructure/posts.repository';
import { CreatePostDto, CreatePostForBlogDto } from '../dto/post-create.dto';
import { UpdatePostDto } from '../dto/post-update.dto';
import { PostEntity, PostModelType } from '../domain/post.entity';
import { BlogsService } from '../../blogs/application/blogs.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsService: BlogsService,
    @InjectModel(PostEntity.name) private PostModel: PostModelType,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<string> {
    const blog = await this.blogsService.findById(createPostDto.blogId);
    const newPost = this.PostModel.buildInstance(createPostDto, blog.name);
    await this.postsRepository.save(newPost);

    return newPost._id.toString();
  }

  async createForBlog(createPostDto: CreatePostForBlogDto, blogId: string): Promise<string> {
    const blog = await this.blogsService.findById(blogId);
    const createPostDtoWithBlogId = { ...createPostDto, blogId };
    const newPost = this.PostModel.buildInstance(createPostDtoWithBlogId, blog.name);
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
