import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaService } from 'prisma/prisma.service';
import { ProfileService } from 'src/user/profile.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ResetToken, ResetTokenSchema } from './resetToken.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema },{ name: ResetToken.name, schema: ResetTokenSchema }]),
    ClientsModule.register([
      {
        name: 'NATS',
        transport: Transport.NATS,
        options: {
          servers: ['nats://localhost:4222'],
        },
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, PrismaService, ProfileService],
  exports: [UserService],
})
export class UserModule {}
