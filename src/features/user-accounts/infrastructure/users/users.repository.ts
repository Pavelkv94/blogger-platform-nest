import { Injectable } from '@nestjs/common';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { BaseUserViewDto, UserViewDtoWithConfirmation, UserViewDtoWithRecovery } from '../../dto/users/user-view.dto';
import { User } from '../../domain/user/user.entity';
import { EmailConfirmation } from '../../domain/user/email-confirmation.entity';
import { RecoveryConfirmation } from '../../domain/user/recovery-confirmation.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private userRepositoryTypeOrm: Repository<User>,
    @InjectRepository(EmailConfirmation) private emailConfirmationRepositoryTypeOrm: Repository<EmailConfirmation>,
    @InjectRepository(RecoveryConfirmation) private recoveryConfirmationRepositoryTypeOrm: Repository<RecoveryConfirmation>,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async findUserById(id: string): Promise<User | null> {
    const user = await this.userRepositoryTypeOrm.findOne({ where: { id: Number(id), deletedAt: IsNull() }, relations: ['emailConfirmation', 'recoveryConfirmation'] });

    if (!user) {
      return null;
    }

    return user;

    // const query = `
    // SELECT u.*, ce.*, pr.*
    // FROM users u
    // LEFT JOIN confirmation_email ce
    // ON u.id = ce.user_id
    // LEFT JOIN password_recovery pr
    // ON u.id = pr.user_id
    // WHERE u.deleted_at IS NULL AND id = $1
    // `;
    // const users = await this.datasourse.query(query, [id]);

    // if (!users.length || !id) {
    //   return null;
    // }
    // //?json_build_object may use
    // return FullUserViewDto.mapToView(users[0]);
  }

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<any | null> {
    const user = await this.userRepositoryTypeOrm
      .createQueryBuilder('user')
      .where('user.deletedAt IS NULL')
      .andWhere('user.login = :loginOrEmail OR user.email = :loginOrEmail', { loginOrEmail })
      .getOne();

    if (!user) {
      return null;
    }

    return user;
  }

  async createEmailConfirmation(emailConfirmation: EmailConfirmation): Promise<EmailConfirmation> {
    return await this.emailConfirmationRepositoryTypeOrm.save(emailConfirmation);
  }

  async createRecoveryConfirmation(recoveryConfirmation: RecoveryConfirmation): Promise<RecoveryConfirmation> {
    return await this.recoveryConfirmationRepositoryTypeOrm.save(recoveryConfirmation);
  }

  async createUser(user: User): Promise<number> {
    //* transaction for create user, emailConfirmation and recoveryConfirmation
    return await this.entityManager.transaction(async (transactionalEntityManager) => {
      const newUser = await transactionalEntityManager.save(User, user);
      const emailConfirmation = EmailConfirmation.buildInstance(newUser.id);
      await transactionalEntityManager.save(EmailConfirmation, emailConfirmation);

      const recoveryConfirmation = RecoveryConfirmation.buildInstance(newUser.id);
      await transactionalEntityManager.save(RecoveryConfirmation, recoveryConfirmation);

      return newUser.id;
    });
  }

  async deleteUser(id: string) {
    await this.userRepositoryTypeOrm.update(id, { deletedAt: new Date() });

    // await this.datasourse.query(`UPDATE users SET deleted_at = NOW() WHERE id = $1`, [id]);
  }

  async findUserByLogin(login: string): Promise<boolean> {
    const user = await this.userRepositoryTypeOrm.findOne({ where: { login } });
    return !!user;

    // const query = `
    // SELECT * FROM users
    // WHERE deleted_at IS NULL AND login = $1
    // `;

    // const users = await this.datasourse.query(query, [login]);

    // return !!users.length;
  }

  async findUserByEmail(email: string): Promise<any | null> {
    const user = await this.userRepositoryTypeOrm.findOne({ where: { email } });
    if (!user) {
      return null;
    }

    return BaseUserViewDto.mapToView(user);

    // const query = `
    // SELECT * FROM users
    // WHERE deleted_at IS NULL AND email = $1
    // `;

    //const users = await this.datasourse.query(query, [email]);

    // if (!users.length || !email) {
    //   return null;
    // }

    // return BaseUserViewDto.mapToView(users[0]);
  }

  async findUserByEmailWithConfirmation(email: string): Promise<UserViewDtoWithConfirmation | null> {
    const user = await this.userRepositoryTypeOrm.findOne({ where: { email, deletedAt: IsNull() }, relations: ['emailConfirmation'] });

    if (!user) {
      return null;
    }

    return UserViewDtoWithConfirmation.mapToView(user);

    // const query = `
    // SELECT u.*, ce.*
    // FROM users u
    // LEFT JOIN confirmation_email ce
    // ON u.id = ce.user_id
    // WHERE u.deleted_at IS NULL AND u.email = $1
    // `;

    // const users = await this.datasourse.query(query, [email]);

    // if (!users.length || !email) {
    //   return null;
    // }

    // return UserViewDtoWithConfirmation.mapToView(users[0]);
  }

  async findUserByConfirmationCode(code: string): Promise<UserViewDtoWithConfirmation | null> {
    const user = await this.userRepositoryTypeOrm.findOne({ where: { emailConfirmation: { confirmationCode: code }, deletedAt: IsNull() }, relations: ['emailConfirmation'] });

    if (!user) {
      return null;
    }

    return UserViewDtoWithConfirmation.mapToView(user);

    // const query = `
    // SELECT u.*, ce.*
    // FROM users u
    // LEFT JOIN confirmation_email ce
    // ON u.id = ce.user_id
    // WHERE u.deleted_at IS NULL AND ce.confirmation_code = $1
    //`;

    // const users = await this.datasourse.query(query, [code]);

    // if (!users.length || !code) {
    //   return null;
    // }

    // return UserViewDtoWithConfirmation.mapToView(users[0]);
  }

  async findUserByRecoveryCode(code: string): Promise<UserViewDtoWithRecovery | null> {
    const user = await this.userRepositoryTypeOrm.findOne({ where: { recoveryConfirmation: { recoveryCode: code }, deletedAt: IsNull() }, relations: ['recoveryConfirmation'] });

    if (!user) {
      return null;
    }

    return UserViewDtoWithRecovery.mapToView(user);

    // const query = `
    // SELECT u.*, pr.*
    // FROM users u
    // LEFT JOIN password_recovery pr
    // ON u.id = pr.user_id
    // WHERE u.deleted_at IS NULL AND pr.recovery_code = $1
    // `;

    // const users = await this.datasourse.query(query, [code]);

    // if (!users.length || !code) {
    //   return null;
    // }

    // return UserViewDtoWithRecovery.mapToView(users[0]);
  }
}
