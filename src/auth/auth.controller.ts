import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  getHello() {
    return this.authService.getHello();
  }

  @Post('register')
  async registerUser(@Body() userData: RegisterUserDto) {
    return this.authService.registerUser(userData);
  }
  @Post('login')
  async loginUser(@Body() userData: LoginUserDto) {
    return this.authService.loginUser(userData);
  }
}
