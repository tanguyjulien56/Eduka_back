import { Module } from '@nestjs/common';
import { EventTagService } from './event_tag.service';
import { EventTagController } from './event_tag.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [EventTagController],
  providers: [EventTagService, PrismaService],
})
export class EventTagModule {}
