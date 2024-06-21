import { Module } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { EventTagController } from './event_tag.controller';
import { EventTagService } from './event_tag.service';

@Module({
  controllers: [EventTagController],
  providers: [EventTagService, PrismaService],
})
export class EventTagModule {}
