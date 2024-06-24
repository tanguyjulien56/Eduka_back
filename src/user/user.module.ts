import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { ProfileService } from './profile.service';

@Module({
  controllers: [UserController],
  providers: [UserService, ProfileService],
  imports: [PrismaModule],
  exports: [UserService]
})
export class UserModule {}
