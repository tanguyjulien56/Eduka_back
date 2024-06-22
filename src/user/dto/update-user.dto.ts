import { PartialType } from '@nestjs/swagger';
import { signinUserDto } from './signin-user.dto';

export class updateUserDto extends PartialType(signinUserDto) {}
