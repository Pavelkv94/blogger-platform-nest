//базовый класс view модели для запросов за списком с пагинацией
import { ApiProperty } from '@nestjs/swagger';

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
