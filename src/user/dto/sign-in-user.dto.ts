import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignUpUserDto {
  name?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
