import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt.auth.guard';
import * as types from 'src/types';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async registerUser(@Body() userData: RegisterUserDto) {
    return this.authService.registerUser(userData);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async loginUser(@Body() userData: LoginUserDto) {
    return this.authService.loginUser(userData);
  }

  @Get('verify-email')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('refresh')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  refresh(
    @Body()
    body: {
      refreshToken: string;
    },
  ) {
    return this.authService.refresh(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  logout(@Req() req: types.AuthRequest) {
    return this.authService.logout(req.user.userId);
  }
}
