import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserInfoDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
