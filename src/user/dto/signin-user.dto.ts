import { IsEmail, IsNotEmpty } from 'class-validator';

export class signinUserDto {

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password:string;
}
