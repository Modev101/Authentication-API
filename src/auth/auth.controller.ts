import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt.auth.guard';
import * as types from 'src/types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  async registerUser(@Body() userData: RegisterUserDto) {
    return this.authService.registerUser(userData);
  }
  @Post('login')
  async loginUser(@Body() userData: LoginUserDto) {
    return this.authService.loginUser(userData);
  }
  @Post('refresh')
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
  logout(@Req() req: types.AuthRequest) {
    return this.authService.logout(req.user.userId);
  }
}
