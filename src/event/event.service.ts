import { Injectable } from '@nestjs/common';
import { Event } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { FormattedEvent } from 'src/interfaces/formatted-event.interface';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}
  create(createEventDto: CreateEventDto) {
    return 'This action adds a new event';
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }
  async findAll(skip?: number, take?: number): Promise<Event[]> {
    const options: any = {
      ...(take && { take }),
      ...(skip && { skip }),
    };
    return this.prisma.event.findMany(options);
  }

  async findPublicEventsFormatted(
    skip: number,
    take: number,
  ): Promise<FormattedEvent[]> {
    const eventsPublic = await this.prisma.event.findMany({
      where: {
        is_public: true,
      },
      skip,
      take,
      include: {
        eventTags: {
          include: {
            eventTag: true,
          },
        },
        address: true,
      },
    });

    const formattedEvents: FormattedEvent[] = eventsPublic.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      start_date: event.start_date.toISOString(),
      end_date: event.end_date.toISOString(),
      guest_limit: event.guest_limit,
      is_public: event.is_public,
      category: event.category,
      user_id: event.user_id,
      status: event.status,
      tags: event.eventTags.map((ehet) => ehet.eventTag.tag),
      address: {
        id: event.address.id,
        address_line: event.address.address_line,
        zip_code: event.address.zip_code,
        city: event.address.city,
        school_id: event.address.school_id,
      },
    }));

    return formattedEvents;
  }
}
