//* Больше не используется так как используется CQRS
// import { Inject, Injectable } from '@nestjs/common';
// import { UsersRepository } from '../infrastructure/users.repository';
// import { InjectModel } from '@nestjs/mongoose';
// import { UserEntity, UserModelType } from '../domain/user.entity';
// import { BcryptService } from './bcrypt.service';

// @Injectable()
// export class UsersService {
//   constructor(
//     private readonly usersRepository: UsersRepository,
//     @Inject() private readonly bcryptService: BcryptService,
//     @InjectModel(UserEntity.name) private UserModel: UserModelType,
//   ) {}

//   async createUser(payload: CreateUserDto): Promise<string> {
//     const loginIsExist = await this.usersRepository.findUserByLogin(payload.login);
//     if (loginIsExist) {
//       throw BadRequestDomainException.create('Login already exists', 'login');
//     }

//     const emailIsExist = await this.usersRepository.findUserByEmail(payload.email);
//     if (emailIsExist) {
//       throw BadRequestDomainException.create('Email already exists', 'email');
//     }

//     const passwordhash = await this.bcryptService.generateHash(payload.password);
//     const newUser = this.UserModel.buildInstance(payload.login, payload.email, passwordhash);

//     await this.usersRepository.save(newUser);

//     return newUser._id.toString();
//   }
//   async deleteUser(id: string): Promise<void> {
//     const user = await this.usersRepository.findOrNotFoundFail(id);

//     user.makeDeleted();

//     await this.usersRepository.save(user);
//   }
// }
