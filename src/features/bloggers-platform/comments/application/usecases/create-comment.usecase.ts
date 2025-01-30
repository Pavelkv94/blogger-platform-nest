import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCommentInputDto } from '../../dto/create-comment.dto';
import { PostsRepository } from 'src/features/bloggers-platform/posts/infrastructure/posts.repository';
import { UserJwtPayloadDto } from 'src/features/user-accounts/dto/users/user-jwt-payload.dto';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UsersRepository } from 'src/features/user-accounts/infrastructure/users/users.repository';

export class CreateCommentCommand {
  constructor(
    public readonly payload: CreateCommentInputDto,
    public readonly postId: string,
    public readonly user: UserJwtPayloadDto,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute(command: CreateCommentCommand): Promise<string> {
    const post = await this.postsRepository.findPostById(command.postId);

    if (!post) {
      throw NotFoundDomainException.create('Post not found');
    }

    const user = await this.usersRepository.findUserById(command.user.userId);

    if (!user) {
      throw NotFoundDomainException.create('User not found');
    }

    const newCommentId = await this.commentsRepository.createComment(command.payload, command.postId, command.user);

    return newCommentId;
  }
}
