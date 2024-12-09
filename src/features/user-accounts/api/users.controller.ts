import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { GetUsersQueryParams } from '../dto/get-users-query-params.input-dto';
import { UserViewDto } from '../dto/user-view.dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Users') //swagger
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @ApiOperation({ summary: 'Get all users' }) //swagger
  @ApiOkResponse({ type: PaginatedViewDto }) //swagger
  @ApiQuery({ type: GetUsersQueryParams }) //swagger
  @Get()
  getUsers(@Query() query: GetUsersQueryParams): Promise<PaginatedViewDto<UserViewDto[]>> {
    const users = this.usersQueryRepository.findUsers(query);

    return users;
  }

  @ApiOperation({ summary: 'Create a new user' }) //swagger
  @ApiOkResponse({ type: UserViewDto }) //swagger
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() body: CreateUserDto) {
    const userId = await this.usersService.createUser(body);
    const newUser = await this.usersQueryRepository.findUserById(userId);

    return newUser;
  }

  @ApiOperation({ summary: 'Delete a user by ID' }) //swagger
  @ApiNoContentResponse() //swagger
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    const user = await this.usersQueryRepository.findUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersService.deleteUser(id);
  }
}
