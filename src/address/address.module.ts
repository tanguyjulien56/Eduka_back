import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { PrismaModule } from 'prisma/prisma.module';
import mongoose from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { AddressSchema } from './address.schema';

@Module({
  controllers: [AddressController],
  providers: [AddressService],
  imports: [MongooseModule.forFeature([{ name: 'Address', schema: AddressSchema }])],
})
export class AddressModule {}
