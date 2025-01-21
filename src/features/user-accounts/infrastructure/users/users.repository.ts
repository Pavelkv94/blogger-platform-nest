import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { BaseUserViewDto, FullUserViewDto, UserViewDtoWithConfirmation, UserViewDtoWithRecovery } from '../../dto/user-view.dto';
import { randomUUID } from 'crypto';
import { getExpirationDate } from 'src/core/utils/date/getExpirationDate';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() private datasourse: DataSource) {}

  async findUserById(id: string): Promise<any | null> {
    const query = `
    SELECT u.*, ce.*, pr.*
	  FROM users u
	  LEFT JOIN confirmation_email ce
	  ON u.id = ce.user_id
	  LEFT JOIN password_recovery pr
	  ON u.id = pr.user_id
	  WHERE u.deleted_at IS NULL AND id = $1
    `;
    const users = await this.datasourse.query(query, [id]);

    if (!users.length || !id) {
      return null;
    }
    //?json_build_object may use
    return FullUserViewDto.mapToView(users[0]);
  }

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<any | null> {
    const query = `
    SELECT * FROM users 
    WHERE deleted_at IS NULL AND ($1 = email OR $1 = login)
  `;

    const users = await this.datasourse.query(query, [loginOrEmail]);

    if (!users.length || !loginOrEmail) {
      return null;
    }

    return users[0];
  }

  async createUser(login: string, email: string, passwordhash: string): Promise<string> {
    const confirmationCode = randomUUID();
    const expirationDate = getExpirationDate(30);

    const query = `
    INSERT INTO users (login, email, password) VALUES ($1, $2, $3) RETURNING id
    `;

    const newUser = await this.datasourse.query(query, [login, email, passwordhash]); // insert user
    // const users = await this.datasourse.query(`SELECT * FROM users WHERE login = $1`, [login]); // select user
    await this.datasourse.query(
      `
      INSERT INTO confirmation_email (user_id, confirmation_code, confirmation_expiration_date) 
      VALUES ($1, $2, $3)`,
      [newUser[0].id, confirmationCode, expirationDate],
    );
    await this.datasourse.query(
      `INSERT INTO password_recovery (user_id) 
      VALUES ($1)`,
      [newUser[0].id],
    );

    return newUser[0].id;
  }

  async deleteUser(id: string) {
    await this.datasourse.query(`UPDATE users SET deleted_at = NOW() WHERE id = $1`, [id]);
  }

  async findUserByLogin(login: string): Promise<boolean> {
    const query = `
    SELECT * FROM users 
    WHERE deleted_at IS NULL AND login = $1
    `;

    const users = await this.datasourse.query(query, [login]);

    return !!users.length;
  }

  async findUserByEmail(email: string): Promise<any | null> {
    const query = `
    SELECT * FROM users 
    WHERE deleted_at IS NULL AND email = $1
    `;

    const users = await this.datasourse.query(query, [email]);

    if (!users.length || !email) {
      return null;
    }

    return BaseUserViewDto.mapToView(users[0]);
  }

  async findUserByEmailWithConfirmation(email: string): Promise<UserViewDtoWithConfirmation | null> {
    const query = `
    SELECT u.*, ce.*
	  FROM users u
	  LEFT JOIN confirmation_email ce
	  ON u.id = ce.user_id
    WHERE u.deleted_at IS NULL AND u.email = $1
    `;

    const users = await this.datasourse.query(query, [email]);

    if (!users.length || !email) {
      return null;
    }

    return UserViewDtoWithConfirmation.mapToView(users[0]);
  }

  async findUserByConfirmationCode(code: string): Promise<UserViewDtoWithConfirmation | null> {
    const query = `
    SELECT u.*, ce.*
	  FROM users u
	  LEFT JOIN confirmation_email ce
	  ON u.id = ce.user_id
    WHERE u.deleted_at IS NULL AND ce.confirmation_code = $1
    `;

    const users = await this.datasourse.query(query, [code]);

    if (!users.length || !code) {
      return null;
    }

    return UserViewDtoWithConfirmation.mapToView(users[0]);
  }

  async findUserByRecoveryCode(code: string): Promise<UserViewDtoWithRecovery | null> {
    const query = `
    SELECT u.*, pr.*
	  FROM users u
	  LEFT JOIN password_recovery pr
	  ON u.id = pr.user_id
    WHERE u.deleted_at IS NULL AND pr.recovery_code = $1
    `;

    const users = await this.datasourse.query(query, [code]);

    if (!users.length || !code) {
      return null;
    }

    return UserViewDtoWithRecovery.mapToView(users[0]);
  }
}
