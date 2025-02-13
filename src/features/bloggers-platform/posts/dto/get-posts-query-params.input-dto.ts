//dto для запроса списка постов с пагинацией, сортировкой, фильтрами
import { PostsSortBy } from './posts-sort-by';
import { BaseSortablePaginationParams } from '../../../../core/dto/base.query-params.input-dto';

export class GetPostsQueryParams extends BaseSortablePaginationParams<PostsSortBy> {
  sortBy = PostsSortBy.CreatedAt;
}
