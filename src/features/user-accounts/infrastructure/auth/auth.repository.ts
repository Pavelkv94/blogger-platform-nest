import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { getExpirationDate } from 'src/core/utils/date/getExpirationDate';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthRepository {
  constructor(@InjectDataSource() private datasourse: DataSource) {}

  async confirmRegistration(user_id: string) {
    const query = `
    UPDATE confirmation_email SET is_confirmed = true WHERE user_id = $1
    `;
    await this.datasourse.query(query, [user_id]);
  }

  async generateNewConfirmationCode(user_id: string): Promise<string> {
    const newConfirmationCode = randomUUID();
    const newConfirmationExpirationDate = getExpirationDate(30);

    const query = `
    UPDATE confirmation_email SET confirmation_code = $1, confirmation_expiration_date = $2 WHERE user_id = $3
    `;
    await this.datasourse.query(query, [newConfirmationCode, newConfirmationExpirationDate, user_id]);

    return newConfirmationCode;
  }

  async generateNewRecoveryCode(user_id: string): Promise<string> {
    const newRecoveryCode = randomUUID();
    const newRecoveryExpirationDate = getExpirationDate(30);

    const query = `
    UPDATE password_recovery SET recovery_code = $1, recovery_expiration_date = $2 WHERE user_id = $3
    `;
    await this.datasourse.query(query, [newRecoveryCode, newRecoveryExpirationDate, user_id]);

    return newRecoveryCode;
  }

  async setNewPassword(user_id: string, newPassword: string) {
    const query = `
    UPDATE users SET password = $1 WHERE id = $2
    `;
    await this.datasourse.query(query, [newPassword, user_id]);
  }
}
