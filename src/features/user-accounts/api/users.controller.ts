import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { GetUsersQueryParams } from '../dto/get-users-query-params.input-dto';
import { UserViewDto } from '../dto/user-view.dto';
import { PaginatedUserViewDto } from 'src/core/dto/base.paginated.view-dto';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { BasicAuthGuard } from 'src/core/guards/basic-auth.guard';
import { SwaggerPostCreate } from 'src/core/decorators/swagger/swagger-post';
import { SwaggerDelete } from 'src/core/decorators/swagger/swagger-delete';
import { Types } from 'mongoose';
import { SwaggerAuthStatus } from 'src/core/decorators/swagger/swagger-options';
import { SwaggerGet } from 'src/core/decorators/swagger/swagger-get';
import { CreateUserCommand } from '../application/usecases/create-user.usecase';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteUserCommand } from '../application/usecases/delete-user.usecase';

@ApiTags('Users') //swagger
@UseGuards(BasicAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @SwaggerGet('Get all users', PaginatedUserViewDto, SwaggerAuthStatus.WithAuth)
  @ApiBasicAuth() //swagger
  @Get()
  getUsers(@Query() query: GetUsersQueryParams): Promise<PaginatedUserViewDto> {
    const users = this.usersQueryRepository.findUsers(query);

    return users;
  }

  @SwaggerPostCreate('Create a new user', UserViewDto, SwaggerAuthStatus.WithAuth)
  @ApiBasicAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() body: CreateUserDto) {
    const userId = await this.commandBus.execute<CreateUserCommand, string>(new CreateUserCommand(body));
    const newUser = await this.usersQueryRepository.findUserByIdOrNotFound(userId);

    return newUser;
  }

  @SwaggerDelete('Delete a user by ID', 'User ID')
  @ApiBasicAuth() //swagger
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: Types.ObjectId): Promise<void> {
    await this.commandBus.execute<DeleteUserCommand, void>(new DeleteUserCommand(id.toString()));
  }
}
