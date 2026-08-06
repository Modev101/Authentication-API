import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Roles } from '@prisma/client';
import { JwtPayload } from 'src/types';
import * as crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuditService } from 'src/audit/audit.service';
import { AuditAction } from 'src/audit/audit-action.enum';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private auditService: AuditService,
  ) {}
  private async generateTokens(user: {
    id: string;
    email: string;
    role: Roles;
    tokenVersion: number;
  }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        hashedRefreshToken: hash,
      },
    });
  }

  async registerUser(userData: RegisterUserDto) {
    const { username, email, password, confirmPassword } = userData;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match!');
    }

    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new BadRequestException('This email is already in use!');
    }

    const existingUsername = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      throw new BadRequestException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const token = crypto.randomBytes(32).toString('hex');

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        verificationToken: hashedToken,
        verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await this.mailService.sendVerificationEmail(user.email, token);

    await this.auditService.log({
      action: AuditAction.REGISTER,
      userId: user.id,
    });
    return {
      message:
        'Registration successful. Please verify your email before logging in.',
    };
  }

  async loginUser(userData: LoginUserDto, req: Request) {
    const { email, password } = userData;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been suspended.');
    }

    const correctPassword = await bcrypt.compare(password, user.password);

    if (!correctPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email.');
    }

    const tokens = await this.generateTokens(user);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
      },
    });
    await this.auditService.log({
      action: AuditAction.LOGIN,
      userId: user.id,
      performedById: user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    return {
      ...tokens,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async verifyEmail(token: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        verificationToken: hashedToken,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    if (
      !user.verificationTokenExpiresAt ||
      user.verificationTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException('Verification token has expired');
    }

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      },
    });
    await this.auditService.log({
      action: AuditAction.VERIFY_EMAIL,
      userId: user.id,
    });
    return {
      message: 'Email verified successfully',
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      return {
        message: 'If an account exists, a password reset email has been sent.',
      };
    }

    const token = crypto.randomBytes(32).toString('hex');

    const hashedToken = await bcrypt.hash(token, 10);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    await this.mailService.sendResetPasswordEmail(user.email, token);
    await this.auditService.log({
      action: AuditAction.FORGOT_PASSWORD,
      userId: user.id,
    });
    return {
      message: 'If an account exists, a password reset email has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const users = await this.prisma.user.findMany({
      where: {
        resetPasswordExpiresAt: {
          gt: new Date(),
        },
      },
    });

    let matchedUser: (typeof users)[number] | null = null;

    for (const user of users) {
      if (!user.resetPasswordToken) {
        continue;
      }

      const matches = await bcrypt.compare(dto.token, user.resetPasswordToken);

      if (matches) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: {
        id: matchedUser.id,
      },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null,

        hashedRefreshToken: null,
      },
    });
    await this.auditService.log({
      action: AuditAction.RESET_PASSWORD,
      userId: matchedUser.id,
    });
    return {
      message: 'Password reset successfully',
    };
  }

  async refresh(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync<JwtPayload>(
      refreshToken,
      {
        secret: process.env.JWT_REFRESH_SECRET!,
      },
    );

    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException();
    }

    const matches = await bcrypt.compare(refreshToken, user.hashedRefreshToken);

    if (!matches) {
      throw new UnauthorizedException();
    }

    const tokens = await this.generateTokens(user);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken: null,
      },
    });
    await this.auditService.log({
      action: AuditAction.LOGOUT,
      userId,
    });
    return {
      message: 'Logged out successfully',
    };
  }
}
