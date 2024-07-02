import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignInUserDto {

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password:string;
}
