import { Injectable } from '@nestjs/common';
import { PaginatedUserViewDto } from 'src/core/dto/base.paginated.view-dto';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { GetUsersQueryParams } from '../../dto/users/get-users-query-params.input-dto';
import { MeViewDto, BaseUserViewDto } from '../../dto/users/user-view.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/user/user.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectRepository(User) private userRepositoryTypeOrm: Repository<User>) {}

  async findUsers(queryData: GetUsersQueryParams): Promise<PaginatedUserViewDto> {
    const { pageSize, pageNumber, sortBy, sortDirection, searchLoginTerm, searchEmailTerm } = queryData;

    const queryBuilder = this.userRepositoryTypeOrm.createQueryBuilder('user').where('user.deletedAt IS NULL');

    if (searchLoginTerm || searchEmailTerm) {
      queryBuilder.andWhere('(login ILIKE :searchLoginTerm OR email ILIKE :searchEmailTerm)', {
        searchLoginTerm: searchLoginTerm ? `%${searchLoginTerm}%` : '%',
        searchEmailTerm: searchEmailTerm ? `%${searchEmailTerm}%` : '%',
      });
    }

    const users = await queryBuilder
      .orderBy(`user.${sortBy}`, sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .skip(queryData.calculateSkip())
      .take(pageSize)
      .getMany();

    const usersView = users.map((user) => BaseUserViewDto.mapToView(user));

    const usersCount = await queryBuilder.getCount();

    return PaginatedUserViewDto.mapToView({
      items: usersView,
      page: pageNumber,
      size: pageSize,
      totalCount: usersCount,
    });
  }

  async findUserByIdOrNotFound(userId: string): Promise<BaseUserViewDto> {
    const user = await this.userRepositoryTypeOrm.createQueryBuilder('user').where('user.deletedAt IS NULL').andWhere('user.id = :userId', { userId: +userId }).getOne();

    if (!user) {
      throw NotFoundDomainException.create();
    }

    return BaseUserViewDto.mapToView(user);
  }
  async findMeByIdOrNotFound(userId: string): Promise<MeViewDto> {
    const user = await this.userRepositoryTypeOrm.createQueryBuilder('user').where('user.deletedAt IS NULL').andWhere('user.id = :userId', { userId: +userId }).getOne();

    if (!user) {
      throw NotFoundDomainException.create();
    }

    return MeViewDto.mapToView(user);
  }
}
