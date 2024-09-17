import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserModule } from './user/user.module';

import { JwtModule } from '@nestjs/jwt';
import { AddressModule } from './address/address.module';

import { ChildrenModule } from './children/children.module';
import { DisciplineModule } from './discipline/discipline.module';
import { EventModule } from './event/event.module';

import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaModule } from 'prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import configuration, { validationSchema } from './config/configuration';
import { EventTagModule } from './event_tag/event_tag.module';
import { MessageModule } from './message/message.module';
import { RoleModule } from './role/role.module';
import { SchoolModule } from './school/school.module';
import { ProfileService } from './user/profile.service';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DATABASE_URL_MONGODB),
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema,
      isGlobal: true,
    }),
    ClientsModule.register([
      //declare à un message broker
      {
        name: 'NATS',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_SERVER_URL],
        },
      },
    ]),
    UserModule,
    PrismaModule,
    EventModule,
    ChildrenModule,
    RoleModule,
    SchoolModule,
    DisciplineModule,
    AddressModule,
    MessageModule,
    EventTagModule,
    AuthModule,
    JwtModule.register({
      secret: 'SECRET_KEY', // Replace with your actual secret key
      signOptions: { expiresIn: '1h' }, // Example expiration (adjust as needed)
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService, ProfileService],
})
export class AppModule {}
