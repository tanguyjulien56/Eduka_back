import { PartialType } from '@nestjs/swagger';
import { CreateEventTagDto } from './create-event_tag.dto';

export class UpdateEventTagDto extends PartialType(CreateEventTagDto) {}
