import { Module } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ChildrenController } from './children.controller';
import { ChildrenService } from './children.service';

@Module({
  controllers: [ChildrenController],
  providers: [ChildrenService, PrismaService],
})
export class ChildrenModule {}
