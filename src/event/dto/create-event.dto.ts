import { EventTagName, UserStatus } from '@prisma/client'; // Importez les enums depuis Prisma
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsInt()
  guest_limit: number;

  @IsBoolean()
  is_public: boolean;

  @IsEnum(EventTagName)
  category: EventTagName;

  @IsString()
  @IsNotEmpty()
  address_id: string;

  @IsEnum(UserStatus)
  status: UserStatus;
}
