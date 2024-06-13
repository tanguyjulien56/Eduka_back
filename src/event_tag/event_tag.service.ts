import { Injectable } from '@nestjs/common';
import { CreateEventTagDto } from './dto/create-event_tag.dto';
import { UpdateEventTagDto } from './dto/update-event_tag.dto';

@Injectable()
export class EventTagService {
  create(createEventTagDto: CreateEventTagDto) {
    return 'This action adds a new eventTag';
  }

  findAll() {
    return `This action returns all eventTag`;
  }

  findOne(id: number) {
    return `This action returns a #${id} eventTag`;
  }

  update(id: number, updateEventTagDto: UpdateEventTagDto) {
    return `This action updates a #${id} eventTag`;
  }

  remove(id: number) {
    return `This action removes a #${id} eventTag`;
  }
}
