import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfileService } from 'src/user/profile.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  controllers: [UserController],
  providers: [UserService, ProfileService],
  imports: [PrismaModule],
})
export class UserModule {}
