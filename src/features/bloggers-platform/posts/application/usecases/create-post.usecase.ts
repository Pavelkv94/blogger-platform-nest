import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostModelType } from '../../domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePostDto, CreatePostForBlogDto } from '../../dto/post-create.dto';
import { PostEntity } from '../../domain/post.entity';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class CreatePostCommand {
  constructor(public readonly payload: CreatePostDto | CreatePostForBlogDto, public readonly blogId?: string) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
    @InjectModel(PostEntity.name) private PostModel: PostModelType,
  ) {}

  async execute(command: CreatePostCommand): Promise<string> {
    const targetBlogId = command.blogId ?? (command.payload as CreatePostDto).blogId;
    const blog = await this.blogsRepository.findBlogByIdOrNotFoundFail(targetBlogId);
    
    const postDtoWithBlogId = command.blogId 
      ? { ...command.payload, blogId: command.blogId } 
      : command.payload as CreatePostDto;
    
    const newPost = this.PostModel.buildInstance(postDtoWithBlogId, blog.name);
    await this.postsRepository.save(newPost);

    return newPost._id.toString();
  }
}
