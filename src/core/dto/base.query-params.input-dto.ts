//базовый класс для query параметров с пагинацией
//значения по-умолчанию применятся автоматически при настройке глобального ValidationPipe в main.ts
import { Type } from 'class-transformer';

class PaginationParams {
  //для трансформации в number
  @Type(() => Number)
  pageNumber: number = 1;
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
