import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProfileDocument = Profile & Document;

@Schema()
export class Profile {
  @Prop({ required: true })
  lastname: string;

  @Prop({ required: true })
  firstname: string;

  @Prop({ required: true })
  photo: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Address', required: true })
  address: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', unique: true })
  user: MongooseSchema.Types.ObjectId;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
