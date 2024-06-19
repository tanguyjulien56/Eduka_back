import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';

import { JwtModule } from '@nestjs/jwt';
import { AddressModule } from './address/address.module';
import { AuthModule } from './auth/auth.module';
import { ChildrenModule } from './children/children.module';
import { DisciplineModule } from './discipline/discipline.module';
import { EventModule } from './event/event.module';
import { EventTagModule } from './event_tag/event_tag.module';
import { MessageModule } from './message/message.module';
import { RoleModule } from './role/role.module';
import { SchoolModule } from './school/school.module';
import { ProfileService } from './user/profile.service';

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService, ProfileService],
})
export class AppModule {}
