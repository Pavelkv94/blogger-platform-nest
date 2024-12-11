import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { GetUsersQueryParams } from '../dto/get-users-query-params.input-dto';
import { UserViewDto } from '../dto/user-view.dto';
import { PaginatedUserViewDto } from 'src/core/dto/base.paginated.view-dto';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { BasicAuthGuard } from 'src/core/guards/basic-auth.guard';

@ApiTags('Users') //swagger
@UseGuards(BasicAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @ApiOperation({ summary: 'Get all users' }) //swagger
  @ApiOkResponse({ type: PaginatedUserViewDto }) //swagger
  @Get()
  getUsers(@Query() query: GetUsersQueryParams): Promise<PaginatedUserViewDto> {
    const users = this.usersQueryRepository.findUsers(query);

    return users;
  }

  @ApiOperation({ summary: 'Create a new user' }) //swagger
  @ApiOkResponse({ type: UserViewDto }) //swagger
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() body: CreateUserDto) {
    const userId = await this.usersService.createUser(body);
    const newUser = await this.usersQueryRepository.findUserByIdOrNotFound(userId);

    return newUser;
  }
  @ApiOperation({ summary: 'Delete a user by ID' }) //swagger
  @ApiNoContentResponse({ description: 'No Content' }) //swagger
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: Types.ObjectId): Promise<void> {
    await this.usersService.deleteUser(id.toString());
  }
}
