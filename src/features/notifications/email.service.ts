import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

type MailPurposeType = 'activationAcc' | 'passwordRecovery';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendConfirmationEmail(email: string, code: string, purpose: MailPurposeType): Promise<void> {
    const isActivation = purpose === 'activationAcc';

    const subject = isActivation ? 'Account activation at ' + process.env.CLIENT_URL : 'Recovery Password at ' + process.env.CLIENT_URL;
    const htmlText = isActivation
      ? `
        <h1>Thank for your registration</h1>
        <p>To finish registration please follow the link below:
            <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
        </p>
        `
      : `
        <h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
            <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
        </p>
        `;

    await this.mailerService.sendMail({
      to: email,
      subject: subject,
      html: htmlText,
    });
  }
}