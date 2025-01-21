import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogCreateDto } from '../../dto/blog-create.dto';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class CreateBlogCommand {
  constructor(public readonly payload: BlogCreateDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: CreateBlogCommand): Promise<string> {
    const newBlogId = await this.blogsRepository.createBlog(command.payload);

    return newBlogId;
  }
}
