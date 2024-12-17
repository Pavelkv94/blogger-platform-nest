import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogModelType } from '../../domain/blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import { BlogCreateDto } from '../../dto/blog-create.dto';
import { BlogEntity } from '../../domain/blog.entity';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class CreateBlogCommand {
  constructor(public readonly payload: BlogCreateDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    @InjectModel(BlogEntity.name) private BlogModel: BlogModelType,
  ) {}

  async execute(command: CreateBlogCommand): Promise<string> {
    const newUser = this.BlogModel.buildInstance(command.payload);

    await this.blogsRepository.save(newUser);

    return newUser._id.toString();
  }
}
