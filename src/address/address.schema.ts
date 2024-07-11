import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AddressDocument = HydratedDocument<Address>;

@Schema()
export class Location {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  long: number;
}

export const LocationSchema = SchemaFactory.createForClass(Location);

@Schema()
export class Address {
  @Prop({ required: true })
  address_line: string;

  @Prop({ required: true })
  zip_code: string;

  @Prop({ required: true })
  city: string;

  @Prop({ type: LocationSchema, required: true })
  location: Location;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
