import { PartialType } from '@nestjs/swagger';
import { SigninUserDto } from './signin-user.dto';

export class updateUserDto extends PartialType(SigninUserDto) {}
