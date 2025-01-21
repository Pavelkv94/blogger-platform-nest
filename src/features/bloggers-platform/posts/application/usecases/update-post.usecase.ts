import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { UpdateBlogPostDto, UpdatePostDto } from '../../dto/post-update.dto';
import { ForbiddenDomainException, NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { BlogsRepository } from 'src/features/bloggers-platform/blogs/infrastructure/blogs.repository';

export class UpdatePostCommand {
  constructor(
    public readonly id: string,
    public readonly payload: UpdatePostDto | UpdateBlogPostDto,
    public readonly blogId?: string,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<void> {
    if (command.blogId) {
      const blog = await this.blogsRepository.findBlogById(command.blogId);

      if (!blog) {
        throw NotFoundDomainException.create('Blog not found');
      }
    }

    const post = await this.postsRepository.findPostById(command.id);

    if (!post) {
      throw NotFoundDomainException.create('Post not found');
    }

    if (command.blogId) {
      if (post.blog_id.toString() !== command.blogId) {
        throw ForbiddenDomainException.create('You are not allowed to update this post');
      }
    }

    await this.postsRepository.updatePost(command.id, command.payload);
  }
}
