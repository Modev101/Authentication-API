import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '@prisma/client';
import { HasRoles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UsersService } from './users.service';
import * as types from 'src/types';
import { UpdateUserInfoDto } from './dto/update-user-info.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('admin')
  @HasRoles(Roles.ADMIN)
  adminRoute() {
    return this.usersService.getAllUsers();
  }

  @Get('profile')
  @HasRoles(Roles.ADMIN, Roles.USER)
  getUserProfile(@Req() req: types.AuthRequest) {
    return this.usersService.getUserProfile(req.user.userId);
  }
  @Patch('profile')
  @HasRoles(Roles.USER)
  updateUserData(
    @Req() req: types.AuthRequest,
    @Body() userData: UpdateUserInfoDto,
  ) {
    return this.usersService.updateUserProfile(req.user.userId, userData);
  }
  @Patch('profile/change-password')
  @HasRoles(Roles.USER)
  changePassword(
    @Req() req: types.AuthRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(req.user.userId, dto);
  }
  @Delete('profile')
  @HasRoles(Roles.USER)
  deleteUser(@Req() req: types.AuthRequest) {
    return this.usersService.deleteUser(req.user.userId);
  }
  @Delete('/:id')
  @HasRoles(Roles.ADMIN)
  deleteUserAdmin(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
