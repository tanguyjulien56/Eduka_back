import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { PrismaService } from 'prisma/prisma.service';
import { PaginatorUtils } from 'src/utils/paginator.utils';

@Module({
  controllers: [EventController],
  providers: [EventService, PrismaService, PaginatorUtils],
})
export class EventModule {}
