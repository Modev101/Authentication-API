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

  async sendResetPasswordEmail(email: string, token: string) {
    const url = `http://localhost:3000/auth/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset your password',
      html: `
      <h2>Password Reset</h2>
      <p>You requested to reset your password.</p>

      <p>
        <a href="${url}">
          Reset Password
        </a>
      </p>

      <p>This link expires in 15 minutes.</p>

      <p>If you didn't request this, ignore this email.</p>
    `,
    });
  }
}
