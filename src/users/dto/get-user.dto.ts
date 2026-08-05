import { IsEmail, IsString } from 'class-validator';
export class GetUserDto {
  @IsString()
  username!: string;

  @IsEmail()
  email!: string;
}
