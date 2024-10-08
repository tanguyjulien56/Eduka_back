import { EventTagName } from '@prisma/client'; // Importez les enums depuis Prisma
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEventDtoSortieLoisirs {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsOptional()
  @IsString()
  photo: string;

  @IsOptional()
  @IsInt()
  guest_limit: number;

  @IsBoolean()
  is_public: boolean;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  zip_code: string;

  @IsOptional()
  location: {
    type: string;
    lat: number;
    long: number;
  };

  @IsArray()
  @IsEnum(EventTagName, { each: true })
  tags: EventTagName[];
}
