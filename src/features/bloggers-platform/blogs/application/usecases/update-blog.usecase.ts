import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { BlogUpdateDto } from '../../dto/blog-update.dto';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';

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
    const blog = await this.blogsRepository.findBlogById(command.id);
    if (!blog) {
      throw NotFoundDomainException.create('Blog not found');
    }

    await this.blogsRepository.updateBlog(command.id, command.payload);
  }
}
