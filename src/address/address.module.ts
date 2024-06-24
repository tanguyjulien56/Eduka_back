import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  controllers: [AddressController],
  providers: [AddressService],
  imports: [PrismaModule],
})
export class AddressModule {}
