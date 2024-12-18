import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';

export class DeletePostCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: DeletePostCommand): Promise<void> {
    const post = await this.postsRepository.findPostById(command.id);

    if (!post) {
      throw NotFoundDomainException.create('Post not found');
    }

    post.makeDeleted();

    await this.postsRepository.save(post);
  }
}
