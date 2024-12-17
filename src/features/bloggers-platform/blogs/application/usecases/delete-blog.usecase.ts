import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class DeleteBlogCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: DeleteBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findBlogByIdOrNotFoundFail(command.id);

    blog.makeDeleted();

    await this.blogsRepository.save(blog);
  }
}
