//базовый класс view модели для запросов за списком с пагинацией
import { ApiProperty } from '@nestjs/swagger';
import { BlogViewDto } from '../../features/bloggers-platform/blogs/dto/blog-view.dto';
import { PostViewDto } from '../../features/bloggers-platform/posts/dto/post-view.dto';
import { CommentViewDto } from '../../features/bloggers-platform/comments/dto/comment-view.dto';
import { BaseUserViewDto } from '../../features/user-accounts/dto/users/user-view.dto';
import { QuestionViewDto } from 'src/features/quiz/questions/dto/question-view.dto';
import { GameViewDto } from 'src/features/quiz/pairGame/dto/game-view.dto';

export abstract class PaginatedViewDto<T> {
  @ApiProperty({ type: 'array', isArray: true })
  abstract items: T;
  @ApiProperty({ example: 100 })
  totalCount: number;
  @ApiProperty({ example: 10 })
  pagesCount: number;
  @ApiProperty({ example: 1 })
  page: number;
  @ApiProperty({ example: 10 })
  pageSize: number;

  //статический метод-утилита для мапинга
  public static mapToView<T>(data: { items: T; page: number; size: number; totalCount: number }): PaginatedViewDto<T> {
    return {
      totalCount: data.totalCount,
      pagesCount: Math.ceil(data.totalCount / data.size),
      page: data.page,
      pageSize: data.size,
      items: data.items,
    };
  }
}

export abstract class PaginatedBlogViewDto extends PaginatedViewDto<BlogViewDto[]> {
  @ApiProperty({ type: [BlogViewDto] })
  items: BlogViewDto[];
}

export abstract class PaginatedPostViewDto extends PaginatedViewDto<PostViewDto[]> {
  @ApiProperty({ type: [PostViewDto] })
  items: PostViewDto[];
}

export abstract class PaginatedCommentViewDto extends PaginatedViewDto<CommentViewDto[]> {
  @ApiProperty({ type: [CommentViewDto] })
  items: CommentViewDto[];
}

export abstract class PaginatedUserViewDto extends PaginatedViewDto<BaseUserViewDto[]> {
  @ApiProperty({ type: [BaseUserViewDto] })
  items: BaseUserViewDto[];
}

export abstract class PaginatedQuestionViewDto extends PaginatedViewDto<QuestionViewDto[]> {
  @ApiProperty({ type: [QuestionViewDto] })
  items: QuestionViewDto[];
}

export abstract class PaginatedGameViewDto extends PaginatedViewDto<GameViewDto[]> {
  @ApiProperty({ type: [GameViewDto] })
  items: GameViewDto[];
}
