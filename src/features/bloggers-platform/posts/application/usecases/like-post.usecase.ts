import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestDomainException, NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { LikeStatus } from 'src/features/bloggers-platform/likes/dto/like-status.dto';
import { LikesRepository } from 'src/features/bloggers-platform/likes/infrastructure/likes.repository';
import { CreateLikeCommand } from 'src/features/bloggers-platform/likes/application/usecases/create-like.usecase';
import { UpdateLikeCommand } from 'src/features/bloggers-platform/likes/application/usecases/update-like.usecase';
import { LikeParent } from 'src/features/bloggers-platform/likes/dto/like-parent.dto';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class LikePostCommand {
  constructor(
    public readonly postId: string,
    public readonly userId: string,
    public readonly newStatus: LikeStatus,
  ) {}
}

@CommandHandler(LikePostCommand)
export class LikePostUseCase implements ICommandHandler<LikePostCommand> {
  constructor(
    private readonly likesRepository: LikesRepository,
    private readonly postsRepository: PostsRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: LikePostCommand): Promise<void> {
    if (!command.newStatus) {
      throw BadRequestDomainException.create('Like status not found', 'likeStatus');
    }

    if (!command.postId) {
      throw NotFoundDomainException.create('Post not found');
    }

    const posts = await this.postsRepository.findPostById(command.postId);

    if (!posts) {
      throw NotFoundDomainException.create('Post not found');
    }

    const like = await this.likesRepository.findLike(command.userId, command.postId);

    if (like) {
      await this.commandBus.execute(new UpdateLikeCommand(like, command.newStatus));
    } else {
      await this.commandBus.execute(new CreateLikeCommand(command.userId, command.postId, command.newStatus, LikeParent.Post));
    }
  }
}
