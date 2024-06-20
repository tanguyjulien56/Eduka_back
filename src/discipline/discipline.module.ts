import { Module } from '@nestjs/common';
import { DisciplineService } from './discipline.service';
import { DisciplineController } from './discipline.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [DisciplineController],
  providers: [DisciplineService, PrismaService],
})
export class DisciplineModule {}
