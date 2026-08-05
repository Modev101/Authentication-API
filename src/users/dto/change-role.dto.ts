import { IsEnum } from 'class-validator';
import { Roles } from '@prisma/client';

export class ChangeRoleDto {
  @IsEnum(Roles)
  role!: Roles;
}
