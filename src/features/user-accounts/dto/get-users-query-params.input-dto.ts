//dto для запроса списка юзеров с пагинацией, сортировкой, фильтрами

import { BaseSortablePaginationParams } from "src/core/dto/base.query-params.input-dto";
import { UsersSortBy } from "./users-sort-by";


export class GetUsersQueryParams extends BaseSortablePaginationParams<UsersSortBy> {
  sortBy = UsersSortBy.CreatedAt;
  searchLoginTerm: string | null = null;
  searchEmailTerm: string | null = null;
}