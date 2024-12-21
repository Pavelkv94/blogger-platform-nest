import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostDocument } from '../../domain/post.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BadRequestDomainException, NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { LikeStatus } from 'src/features/bloggers-platform/likes/dto/like-status.dto';
import { LikesRepository } from 'src/features/bloggers-platform/likes/infrastructure/likes.repository';
import { LikeDocument } from 'src/features/bloggers-platform/likes/domain/like.entity';
import { CreateLikeCommand } from 'src/features/bloggers-platform/likes/application/usecases/create-like.usecase';
import { UpdateLikeCommand } from 'src/features/bloggers-platform/likes/application/usecases/update-like.usecase';

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
    if(!command.newStatus) {
      throw BadRequestDomainException.create("Like status not found", "likeStatus")
    }
    
    if(!command.postId) {
      throw NotFoundDomainException.create("Post not found")
    }
    const like = await this.likesRepository.findLike(command.userId, command.postId);

    await this.updatePostLikesCount(command.postId, like, command.newStatus);

    if (like) {
      await this.commandBus.execute(new UpdateLikeCommand(like, command.newStatus));
    } else {
      await this.commandBus.execute(new CreateLikeCommand(command.userId, command.postId, command.newStatus));
    }
  }

  private async updatePostLikesCount(postId: string, likeDocument: LikeDocument | null, newStatus: LikeStatus): Promise<void> {
    const post = await this.postsRepository.findPostById(postId);

    if (!post) {
      throw NotFoundDomainException.create();
    }

    if (!likeDocument) {
      //first like
      this.likesCounter(LikeStatus.None, newStatus, post);
    } else {
      //existing like
      this.likesCounter(likeDocument.status, newStatus, post);
    }

    await this.postsRepository.save(post);
  }
  private async likesCounter(prevStatus: LikeStatus, newStatus: LikeStatus, post: PostDocument) {
    if (prevStatus === 'Like') post.extendedLikesInfo.likesCount -= 1;
    if (prevStatus === 'Dislike') post.extendedLikesInfo.dislikesCount -= 1;
    if (newStatus === 'Like') post.extendedLikesInfo.likesCount += 1;
    if (newStatus === 'Dislike') post.extendedLikesInfo.dislikesCount += 1;
  }
}
