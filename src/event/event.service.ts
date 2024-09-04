import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Event, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CardEvent } from 'src/interfaces/cardEvent';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async findPublicEvents(paginator: {
    skip: number;
    take: number;
  }): Promise<CardEvent[]> {
    const eventsPublic = await this.prisma.event.findMany({
      where: {
        is_public: true,
        start_date: {
          gte: new Date(),
        },
      },
      skip: paginator.skip,
      take: paginator.take,
      include: {
        user: {
          include: {
            profil: true,
          },
        },
        eventTags: {
          include: {
            eventTag: true,
          },
        },
        address: true,
      },
    });

    return eventsPublic.map((event) => this.cardFormattedEvent(event));
  }

  async create(createEventDto: CreateEventDto, userId: string) {
    const event = await this.prisma.event.create({
      data: {
        user_id: userId,
        ...createEventDto,
      },
    });

    return event;
  }

  async update(
    eventId: string,
    updateEventDto: UpdateEventDto,
    userId: string,
  ): Promise<boolean> {
    // Vérifier si l'événement existe et appartient à l'utilisateur
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    console.log(
      '🚀 ~ file: event.service.ts:EventService.update ~ event:',
      event,
    );
    if (!event) {
      return false;
    }
    console.log(
      '🚀 ~ file: event.service.ts:EventService.update ~ event.user_id:',
      event.user_id,
      'userId:',
      userId,
    );
    if (event.user_id !== userId) {
      throw new ForbiddenException('Not authorized to update this event');
    }

    await this.prisma.event.update({
      where: { id: eventId },
      data: {
        title: updateEventDto.title,
        description: updateEventDto.description,
        start_date: new Date(updateEventDto.start_date),
        end_date: new Date(updateEventDto.end_date),
        photo: updateEventDto.photo,
        guest_limit: updateEventDto.guest_limit,
        is_public: updateEventDto.is_public,
        category: updateEventDto.category,
        address_id: updateEventDto.address_id,
        status: updateEventDto.status,
      },
    });

    return true;
  }
  async delete(eventId: string, userId: string): Promise<Event> {
    return this.prisma.event.delete({
      where: { id: eventId, user_id: userId },
    });
  }

  private async getEventById(eventId: string): Promise<Event> {
    try {
      return await this.prisma.event.findUnique({
        where: { id: eventId },
      });
    } catch (error) {
      throw new BadRequestException(`Event with id ${eventId} not found`);
    }
  }
  private cardFormattedEvent(
    event: Prisma.EventGetPayload<{
      include: {
        user: { include: { profil: true } };
        eventTags: { include: { eventTag: true } };
        address: true;
      };
    }>,
  ): CardEvent {
    return {
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
      picture: event.photo || 'default_image_url.jpg',
      tags: event.eventTags.map((eventTag) => eventTag.eventTag.tag),
      address: {
        city: event.address.city,
        location: event.address.location as string,
      },
      user: {
        lastname: event.user.profil.lastname,
        firstname: event.user.profil.firstname,
        profil_picture: event.user.profil.photo || '',
      },
    };
  }
}
