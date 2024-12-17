import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostModelType } from '../../domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PostEntity } from '../../domain/post.entity';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { UpdatePostDto } from '../../dto/post-update.dto';

export class UpdatePostCommand {
  constructor(
    public readonly id: string,
    public readonly payload: UpdatePostDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
    @InjectModel(PostEntity.name) private PostModel: PostModelType,
  ) {}

  async execute(command: UpdatePostCommand): Promise<void> {
    const post = await this.postsRepository.findPostByIdOrNotFoundFail(command.id);

    post.update(command.payload);

    await this.postsRepository.save(post);
  }
}
