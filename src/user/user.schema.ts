import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Address {
  @Prop({ required: true })
  address_line: string;

  @Prop({ required: true })
  zip_code: string;

  @Prop({ required: true })
  city: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

@Schema()
export class Profile {
  @Prop({ required: true })
  lastname: string;

  @Prop({ required: true })
  firstname: string;

  @Prop({ required: true })
  photo: string;

  @Prop({ type: AddressSchema, required: true })
  address: Address;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);

@Schema()
export class User extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  created_at: Date;

  @Prop({ required: true })
  updated_at: Date;

  @Prop({ type: ProfileSchema, required: true })
  profile: Profile;

  @Prop({
    // Spécifiez le type ici
    required: true,
    type: {
      // Utilisez cette syntaxe pour spécifier le type
      school_id: Number, // Si school_id est un nombre
    },
  })
  schools: {
    school_id: number;
  };
  @Prop({ required: true })
  roles: {
    role_id: number;
  }[];
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = User & Document;
