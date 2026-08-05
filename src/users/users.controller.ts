import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
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
import { ChangeRoleDto } from './dto/change-role.dto';
import { Throttle } from '@nestjs/throttler';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('admin')
  @HasRoles(Roles.ADMIN)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  getUsers(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
  ) {
    return this.usersService.getAllUsers(Number(page), Number(limit), search);
  }

  @Get('profile')
  @HasRoles(Roles.ADMIN, Roles.USER)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  getUserProfile(@Req() req: types.AuthRequest) {
    return this.usersService.getUserProfile(req.user.userId);
  }

  @Patch('profile')
  @HasRoles(Roles.USER)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  updateUserData(
    @Req() req: types.AuthRequest,
    @Body() userData: UpdateUserInfoDto,
  ) {
    return this.usersService.updateUserProfile(req.user.userId, userData);
  }

  @Patch('profile/change-password')
  @HasRoles(Roles.USER)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  changePassword(
    @Req() req: types.AuthRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(req.user.userId, dto);
  }

  @Delete('profile')
  @HasRoles(Roles.USER)
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  deleteUser(@Req() req: types.AuthRequest) {
    return this.usersService.deleteOwnAccount(req.user.userId);
  }
  @Patch(':id/suspend')
  @HasRoles(Roles.ADMIN)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  suspend(@Req() req: types.AuthRequest, @Param('id') id: string) {
    return this.usersService.suspendUser(req.user.userId, id);
  }

  @Patch(':id/activate')
  @HasRoles(Roles.ADMIN)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  activate(@Param('id') id: string) {
    return this.usersService.activateUser(id);
  }
  @Patch(':id/role')
  @HasRoles(Roles.ADMIN)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  changeRole(@Param('id') id: string, @Body() dto: ChangeRoleDto) {
    return this.usersService.changeRole(id, dto.role);
  }

  @Delete('/:id')
  @HasRoles(Roles.ADMIN)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  deleteUserAdmin(@Req() req: types.AuthRequest, @Param('id') id: string) {
    return this.usersService.deleteUserByAdmin(req.user.userId, id);
  }
}
