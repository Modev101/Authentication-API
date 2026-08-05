import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserInfoDto } from './dto/update-user-info.dto';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Roles } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            {
              username: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              email: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {};

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({
        where,
      }),
    ]);

    return {
      users,
      total,
      page,
      limit,
    };
  }

  async getUserProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateUserProfile(userId: string, userData: UpdateUserInfoDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const data: Partial<{
      username: string;
      email: string;
    }> = {};

    if (userData.username && userData.username !== existingUser.username) {
      const usernameExists = await this.prisma.user.findFirst({
        where: {
          username: userData.username,
          NOT: {
            id: userId,
          },
        },
      });

      if (usernameExists) {
        throw new BadRequestException('Username already exists');
      }

      data.username = userData.username;
    }

    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findFirst({
        where: {
          email: userData.email,
          NOT: {
            id: userId,
          },
        },
      });

      if (emailExists) {
        throw new BadRequestException('Email already exists');
      }

      data.email = userData.email;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'User updated successfully',
      user: updatedUser,
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordMatches = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!passwordMatches) {
      throw new BadRequestException('Current password is incorrect');
    }

    const samePassword = await bcrypt.compare(
      changePasswordDto.newPassword,
      user.password,
    );

    if (samePassword) {
      throw new BadRequestException(
        'New password must be different from the current password',
      );
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,

        // Logout from every device
        hashedRefreshToken: null,
      },
    });

    return {
      message: 'Password changed successfully. Please login again.',
    };
  }

  async suspendUser(adminId: string, userId: string) {
    if (adminId === userId) {
      throw new BadRequestException('You cannot suspend your own account.');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (!existingUser.isActive) {
      throw new BadRequestException('User is already suspended');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        hashedRefreshToken: null,
        tokenVersion: {
          increment: 1,
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        emailVerified: true,
        isActive: true,
        lastLoginAt: true,
        tokenVersion: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'User suspended successfully',
      user,
    };
  }

  async activateUser(id: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (existingUser.isActive) {
      throw new BadRequestException('User is already active');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        isActive: true,
        tokenVersion: {
          increment: 1,
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        emailVerified: true,
        isActive: true,
        lastLoginAt: true,
        tokenVersion: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'User activated successfully',
      user,
    };
  }

  async changeRole(id: string, role: Roles) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        role,
      },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });

    return {
      message: 'Role updated successfully',
      user,
    };
  }

  async deleteOwnAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        hashedRefreshToken: null,
        tokenVersion: {
          increment: 1,
        },
      },
    });

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      message: 'User deleted successfully',
    };
  }

  async deleteUserByAdmin(adminId: string, userId: string) {
    if (adminId === userId) {
      throw new BadRequestException('You cannot delete your own account.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        hashedRefreshToken: null,
        tokenVersion: {
          increment: 1,
        },
      },
    });

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      message: 'User deleted successfully',
    };
  }
}
