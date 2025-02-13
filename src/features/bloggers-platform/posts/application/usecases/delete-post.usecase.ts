import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { ForbiddenDomainException, NotFoundDomainException } from '../../../../../core/exeptions/domain-exceptions';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

export class DeletePostCommand {
  constructor(
    public readonly postId: string,
    public readonly blogId?: string,
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(command: DeletePostCommand): Promise<void> {
    if (command.blogId) {
      const blog = await this.blogsRepository.findBlogById(command.blogId);

      if (!blog) {
        throw NotFoundDomainException.create('Blog not found');
      }
    }

    const post = await this.postsRepository.findPostById(command.postId);

    if (!post) {
      throw NotFoundDomainException.create('Post not found');
    }

    if (command.blogId) {
      if (post.blogId.toString() !== command.blogId) {
        throw ForbiddenDomainException.create('You are not allowed to delete this post');
      }
    }

    await this.postsRepository.deletePost(post);
  }
}
