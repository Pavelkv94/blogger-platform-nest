import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { BlogUpdateDto } from '../../dto/blog-update.dto';

export class UpdateBlogCommand {
  constructor(
    public readonly id: string,
    public readonly payload: BlogUpdateDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findBlogByIdOrNotFoundFail(command.id);

    blog.update(command.payload);

    await this.blogsRepository.save(blog);
  }
}
