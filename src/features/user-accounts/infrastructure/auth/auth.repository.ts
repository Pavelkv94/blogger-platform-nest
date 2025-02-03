import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { getExpirationDate } from 'src/core/utils/date/getExpirationDate';
import { DataSource, Repository } from 'typeorm';
import { RecoveryConfirmation } from '../../domain/user/recovery-confirmation.entity';
import { EmailConfirmation } from '../../domain/user/email-confirmation.entity';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { User } from '../../domain/user/user.entity';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectDataSource() private datasourse: DataSource,
    @InjectRepository(EmailConfirmation) private emailConfirmationRepositoryTypeOrm: Repository<EmailConfirmation>,
    @InjectRepository(RecoveryConfirmation) private recoveryConfirmationRepositoryTypeOrm: Repository<RecoveryConfirmation>,
    @InjectRepository(User) private userRepositoryTypeOrm: Repository<User>,
  ) {}

  async confirmRegistration(user_id: string) {
    const emailConfirmation = await this.emailConfirmationRepositoryTypeOrm.findOne({ where: { userId: +user_id } });

    if (!emailConfirmation) {
      throw NotFoundDomainException.create('Email confirmation not found');
    }

    emailConfirmation.markConfirmed();

    await this.emailConfirmationRepositoryTypeOrm.save(emailConfirmation);

    // const query = `
    // UPDATE confirmation_email SET is_confirmed = true WHERE user_id = $1
    // `;
    // await this.datasourse.query(query, [user_id]);
  }

  async generateNewConfirmationCode(user_id: string): Promise<string> {
    const newConfirmationCode = randomUUID();
    const newConfirmationExpirationDate = getExpirationDate(30);

    const emailConfirmation = await this.emailConfirmationRepositoryTypeOrm.findOne({ where: { userId: +user_id } });

    if (!emailConfirmation) {
      throw NotFoundDomainException.create('Email confirmation not found');
    }

    emailConfirmation.setNewCode(newConfirmationCode, newConfirmationExpirationDate);

    await this.emailConfirmationRepositoryTypeOrm.save(emailConfirmation);

    // const query = `
    // UPDATE confirmation_email SET confirmation_code = $1, confirmation_expiration_date = $2 WHERE user_id = $3
    // `;
    // await this.datasourse.query(query, [newConfirmationCode, newConfirmationExpirationDate, user_id]);

    return newConfirmationCode;
  }

  async generateNewRecoveryCode(user_id: string): Promise<string> {
    const recoveryConfirmation = await this.recoveryConfirmationRepositoryTypeOrm.findOne({ where: { userId: +user_id } });

    if (!recoveryConfirmation) {
      throw NotFoundDomainException.create('Recovery confirmation not found');
    }

    const newRecoveryCode = randomUUID();
    const newRecoveryExpirationDate = getExpirationDate(30);

    recoveryConfirmation.setNewCode(newRecoveryCode, newRecoveryExpirationDate);

    await this.recoveryConfirmationRepositoryTypeOrm.save(recoveryConfirmation);

    // const query = `
    // UPDATE password_recovery SET recovery_code = $1, recovery_expiration_date = $2 WHERE user_id = $3
    // `;
    // await this.datasourse.query(query, [newRecoveryCode, newRecoveryExpirationDate, user_id]);

    return newRecoveryCode;
  }

  async setNewPassword(user_id: string, newPassword: string) {
    const user = await this.userRepositoryTypeOrm.findOne({ where: { id: +user_id } });

    if (!user) {
      throw NotFoundDomainException.create('User not found');
    }

    user.updatePassword(newPassword);
    await this.userRepositoryTypeOrm.save(user);

    // const query = `
    // UPDATE users SET password = $1 WHERE id = $2
    // `;
    // await this.datasourse.query(query, [newPassword, user_id]);
  }
}
