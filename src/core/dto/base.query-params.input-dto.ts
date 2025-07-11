//базовый класс для query параметров с пагинацией
//значения по-умолчанию применятся автоматически при настройке глобального ValidationPipe в main.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested, IsArray, IsOptional } from 'class-validator';
import { TransformSortQuery } from '../decorators/transform/sort-query';

export interface SortParameter<T> {
  field: T;
  direction: SortDirection;
}

class PaginationParams {
  //для трансформации в number
  @ApiProperty({ example: 1, description: 'Page number', type: Number, required: false }) //swagger
  @Type(() => Number)
  pageNumber: number = 1;
  @ApiProperty({ example: 10, description: 'Page size', type: Number, required: false }) //swagger
  @Type(() => Number)
  pageSize: number = 10;

  calculateSkip() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}

export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

//базовый класс для query параметров с сортировкой и пагинацией
//поле sortBy должно быть реализовано в наследниках
export abstract class BaseSortablePaginationParams<T> extends PaginationParams {
  sortDirection: SortDirection = SortDirection.Desc;
  abstract sortBy: T;
}

export abstract class BaseSortableStringPaginationParams<T> extends PaginationParams {
  @ApiProperty({
    example: [{ field: 'avgScores', direction: 'desc' }, { field: 'sumScore', direction: 'desc' }],
    description: 'Array of sort parameters',
    type: 'array',
    required: false
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  @IsOptional()
  @TransformSortQuery()
  sort: SortParameter<T>[] = [];
}