import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserHasSchoolDocument = UserHasSchool & Document;

@Schema()
export class UserHasSchool {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'School', required: true })
  school: MongooseSchema.Types.ObjectId;
}

export const UserHasSchoolSchema = SchemaFactory.createForClass(UserHasSchool);