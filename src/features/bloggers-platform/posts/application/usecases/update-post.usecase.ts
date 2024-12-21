import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { UpdatePostDto } from '../../dto/post-update.dto';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';

export class UpdatePostCommand {
  constructor(
    public readonly id: string,
    public readonly payload: UpdatePostDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private readonly postsRepository: PostsRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<void> {
    const post = await this.postsRepository.findPostById(command.id);

    if (!post) {
      throw NotFoundDomainException.create('Post not found');
    }

    post.update(command.payload);

    await this.postsRepository.save(post);
  }
}
