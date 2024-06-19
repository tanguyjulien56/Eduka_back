import { UserStatus } from '@prisma/client';

export class UpdateUserDto {
  email?: string;
  password?: string;
  status: UserStatus;
}
