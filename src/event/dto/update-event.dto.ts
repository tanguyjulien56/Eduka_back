import { EventTagName, UserStatus } from '@prisma/client'; // Assurez-vous d'importer les enums depuis Prisma
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsInt()
  guest_limit?: number;

  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @IsOptional()
  @IsEnum(EventTagName)
  category?: EventTagName;

  @IsOptional()
  @IsString()
  address_id?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
