import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerConfig } from './mailer.config';

@Module({
  imports: [
    // MailerModule.forRoot({
    //   transport: {
    //     host: process.env.SMTP_HOST,
    //     port: Number(process.env.SMTP_PORT),
    //     auth: {
    //       user: process.env.SMTP_USER,
    //       pass: process.env.SMTP_PASSWORD,
    //     },
    //   },
    //   defaults: {
    //     from: process.env.SMTP_USER,
    //   },
    // }),
    MailerModule.forRootAsync({
      useFactory: (mailerConfig: MailerConfig) => ({
        transport: {
          host: mailerConfig.smtp_host,
          port: Number(mailerConfig.smtp_port),
          auth: {
            user: mailerConfig.smtp_user,
            pass: mailerConfig.smtp_password,
          },
        },
        defaults: {
          from: mailerConfig.smtp_user,
        },
      }),
      inject: [MailerConfig],
      extraProviders: [MailerConfig], //? без этого не работает
    }),
  ],
  exports: [EmailService],
  providers: [EmailService, MailerConfig],
})
export class NotificationsModule {}
