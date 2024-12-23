import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginatedUserViewDto } from 'src/core/dto/base.paginated.view-dto';
import { DeletionStatus } from 'src/core/dto/deletion-status';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { GetUsersQueryParams } from '../../dto/get-users-query-params.input-dto';
import { UserEntity, UserModelType } from '../../domain/user/user.entity';
import { MeViewDto, UserViewDto } from '../../dto/user-view.dto';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(UserEntity.name) private UserModel: UserModelType) {}

  async findUsers(queryData: GetUsersQueryParams): Promise<PaginatedUserViewDto> {
    const { pageSize, pageNumber, sortBy, sortDirection, searchLoginTerm, searchEmailTerm } = queryData;

    let filter: any = {
      $or: [],
    };

    if (searchLoginTerm) {
      filter.$or.push({ login: { $regex: searchLoginTerm, $options: 'i' }, deletionStatus: DeletionStatus.NotDeleted });
    }
    if (searchEmailTerm) {
      filter.$or.push({ email: { $regex: searchEmailTerm, $options: 'i' }, deletionStatus: DeletionStatus.NotDeleted });
    }

    if (filter.$or.length === 0) {
      filter = { deletionStatus: DeletionStatus.NotDeleted };
    }

    const usersFromDb = await this.UserModel.find({ ...filter, deletionStatus: DeletionStatus.NotDeleted })
      .skip(queryData.calculateSkip())
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection });

    const usersView = usersFromDb.map((user) => UserViewDto.mapToView(user));

    const usersCount = await this.getUsersCount(searchLoginTerm || '', searchEmailTerm || '');

    return PaginatedUserViewDto.mapToView({
      items: usersView,
      page: pageNumber,
      size: pageSize,
      totalCount: usersCount,
    });
  }

  async findUserByIdOrNotFound(userId: string): Promise<UserViewDto> {
    const user = await this.UserModel.findOne({ _id: userId, deletionStatus: DeletionStatus.NotDeleted });

    if (!user) {
      throw NotFoundDomainException.create();
    }

    return UserViewDto.mapToView(user);
  }
  async findMeByIdOrNotFound(userId: string): Promise<MeViewDto> {
    const user = await this.UserModel.findOne({ _id: userId, deletionStatus: DeletionStatus.NotDeleted });

    if (!user) {
      throw NotFoundDomainException.create();
    }

    return MeViewDto.mapToView(user);
  }
  async getUsersCount(searchLoginTerm: string, searchEmailTerm: string): Promise<number> {
    let filter: any = {
      $or: [],
    };

    if (searchLoginTerm) {
      filter.$or.push({ login: { $regex: searchLoginTerm, $options: 'i' }, deletionStatus: DeletionStatus.NotDeleted });
    }
    if (searchEmailTerm) {
      filter.$or.push({ email: { $regex: searchEmailTerm, $options: 'i' }, deletionStatus: DeletionStatus.NotDeleted });
    }

    if (filter.$or.length === 0) {
      filter = { deletionStatus: DeletionStatus.NotDeleted };
    }

    return this.UserModel.countDocuments(filter);
  }
}
