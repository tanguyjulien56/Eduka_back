import { PartialType } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
