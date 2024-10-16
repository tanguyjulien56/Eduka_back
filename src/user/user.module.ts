import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaService } from 'prisma/prisma.service';
import { ProfileService } from 'src/user/profile.service';
import { PaginatorUtils } from 'src/utils/paginator.utils';
import { ResetToken, ResetTokenSchema } from './resetToken.schema';
import { UserController } from './user.controller';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ResetToken.name, schema: ResetTokenSchema },
    ]),
    // ClientsModule.register([
    //   {
    //     name: 'NATS',
    //     transport: Transport.NATS,
    //     options: {
    //       servers: ['nats://localhost:4222'],
    //     },
    //   },
    // ]),
  ],
  controllers: [UserController],
  providers: [UserService, PrismaService, ProfileService, PaginatorUtils],
  exports: [UserService],
})
export class UserModule {}
