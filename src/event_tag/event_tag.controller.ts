import { Controller } from '@nestjs/common';
import { EventTagService } from './event_tag.service';

@Controller('event-tag')
export class EventTagController {
  constructor(private readonly eventTagService: EventTagService) {}

  // @Post()
  // create(@Body() createEventTagDto: CreateEventTagDto) {
  //   return this.eventTagService.create(createEventTagDto);
  // }

  // @Get()
  // findAll() {
  //   return this.eventTagService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.eventTagService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateEventTagDto: UpdateEventTagDto) {
  //   return this.eventTagService.update(+id, updateEventTagDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.eventTagService.remove(+id);
  // }
}
