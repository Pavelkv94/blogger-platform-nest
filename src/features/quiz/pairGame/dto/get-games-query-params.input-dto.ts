//dto для запроса списка юзеров с пагинацией, сортировкой, фильтрами

import { BaseSortablePaginationParams } from "../../../../core/dto/base.query-params.input-dto";
import { GameSortBy } from "./game-sort-by";
import { IsEnum } from "class-validator";


export class GetGamesQueryParams extends BaseSortablePaginationParams<GameSortBy> {
  @IsEnum(GameSortBy)
  sortBy = GameSortBy.PairCreatedDate;
}