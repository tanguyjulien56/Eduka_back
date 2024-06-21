import { Module } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  controllers: [MessageController],
  providers: [MessageService, PrismaService],
})
export class MessageModule {}
