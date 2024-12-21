import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { CreateCommentInputDto } from '../../dto/create-comment.dto';
import { PostsRepository } from 'src/features/bloggers-platform/posts/infrastructure/posts.repository';
import { UserJwtPayloadDto } from 'src/features/user-accounts/dto/user-jwt-payload.dto';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { CommentEntity, CommentModelType } from '../../domain/comment.entity';
import { UsersRepository } from 'src/features/user-accounts/infrastructure/users.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';

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
    @InjectModel(CommentEntity.name) private CommentModel: CommentModelType,
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

    const newComment = this.CommentModel.buildInstance({ content: command.payload.content, postId: command.postId, user });

    await this.commentsRepository.save(newComment);

    return newComment._id.toString();
  }
}
