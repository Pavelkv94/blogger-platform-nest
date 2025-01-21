import { Injectable } from '@nestjs/common';
import { PaginatedUserViewDto } from 'src/core/dto/base.paginated.view-dto';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { GetUsersQueryParams } from '../../dto/get-users-query-params.input-dto';
import { MeViewDto, BaseUserViewDto } from '../../dto/user-view.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() private datasourse: DataSource) {}

  async findUsers(queryData: GetUsersQueryParams): Promise<PaginatedUserViewDto> {
    const { pageSize, pageNumber, sortBy, sortDirection, searchLoginTerm, searchEmailTerm } = queryData;

    const conditions: string[] = [];
    const values: string[] = [];

    if (searchLoginTerm) {
      conditions.push(`login ILIKE $${conditions.length + 1}`);
      values.push(`%${searchLoginTerm}%`);
    }

    if (searchEmailTerm) {
      conditions.push(`email ILIKE $${conditions.length + 1}`);
      values.push(`%${searchEmailTerm}%`);
    }

    const query = `
SELECT * FROM users 
WHERE deleted_at IS NULL ${conditions.length > 0 ? `AND ${conditions.join(' OR ')}` : ''}
ORDER BY ${sortBy} ${sortDirection} 
LIMIT ${pageSize} OFFSET ${queryData.calculateSkip()}
`;

    const users = await this.datasourse.query(query, values);

    const usersCount = await this.datasourse.query(
      `
      SELECT COUNT(*) FROM users 
      WHERE deleted_at IS NULL ${conditions.length > 0 ? `AND ${conditions.join(' OR ')}` : ''}
    `,
      values,
    );

    const usersView = users.map((user) => BaseUserViewDto.mapToView(user));

    return PaginatedUserViewDto.mapToView({
      items: usersView,
      page: pageNumber,
      size: pageSize,
      totalCount: +usersCount[0].count,
    });
  }

  async findUserByIdOrNotFound(userId: string): Promise<BaseUserViewDto> {
    const query = `
    SELECT * FROM users 
    WHERE deleted_at IS NULL AND id = $1
    `;

    const users = await this.datasourse.query(query, [userId]);

    if (!users.length) {
      throw NotFoundDomainException.create();
    }

    return BaseUserViewDto.mapToView(users[0]);
  }
  async findMeByIdOrNotFound(userId: string): Promise<MeViewDto> {
    const query = `
    SELECT * FROM users 
    WHERE deleted_at IS NULL AND id = $1
    `;

    const users = await this.datasourse.query(query, [userId]);

    if (!users.length) {
      throw NotFoundDomainException.create();
    }

    return MeViewDto.mapToView(users[0]);
  }
}
