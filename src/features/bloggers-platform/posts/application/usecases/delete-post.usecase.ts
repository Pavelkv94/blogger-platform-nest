import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class DeletePostCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: DeletePostCommand): Promise<void> {
    const post = await this.postsRepository.findPostByIdOrNotFoundFail(command.id);

    post.makeDeleted();

    await this.postsRepository.save(post);
  }
}
