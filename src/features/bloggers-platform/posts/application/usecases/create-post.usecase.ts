import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostDto, CreatePostForBlogDto } from '../../dto/post-create.dto';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';

export class CreatePostCommand {
  constructor(
    public readonly payload: CreatePostDto | CreatePostForBlogDto,
    public readonly blogId?: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<string> {
    const targetBlogId = command.blogId ?? (command.payload as CreatePostDto).blogId;
    const blog = await this.blogsRepository.findBlogById(targetBlogId);

    if (command.blogId && !blog) {
      throw NotFoundDomainException.create('Blog not found');
    }
    const postDtoWithBlogId = command.blogId ? { ...command.payload, blogId: command.blogId } : (command.payload as CreatePostDto);

    const newPostId = await this.postsRepository.createPost(postDtoWithBlogId);

    return newPostId;
  }
}

