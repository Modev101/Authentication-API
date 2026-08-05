import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(email: string, token: string) {
    const url = `http://localhost:3000/auth/verify-email?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify your email',
      html: `
        <h2>Welcome!</h2>
        <p>Please verify your email address.</p>
        <a href="${url}">Verify Email</a>
      `,
    });
  }
}
