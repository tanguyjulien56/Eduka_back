import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Event, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { eventCard } from 'src/interfaces/eventCard';

import { CreateEventDtoSortieLoisirs } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async findPublicEvents(paginator: {
    skip: number;
    take: number;
  }): Promise<eventCard[]> {
    const eventsPublic = await this.prisma.event.findMany({
      where: {
        is_public: true,
        end_date: {
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

  async findMyEvents(
    paginator: {
      skip: number;
      take: number;
    },
    userId: string,
  ): Promise<eventCard[]> {
    const eventsPublic = await this.prisma.event.findMany({
      where: {
        end_date: {
          gte: new Date(),
        },
        user_id: userId,
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

  async findMyParticipations(
    paginator: { skip: number; take: number },
    userId: string,
  ): Promise<eventCard[]> {
    const eventsPublic = await this.prisma.event.findMany({
      where: {
        end_date: { gte: new Date() },
        attendances: {
          some: {
            children: {
              user_id: userId,
            },
          },
        },
      },
      skip: paginator.skip,
      take: paginator.take,
      include: {
        user: { include: { profil: true } },
        eventTags: { include: { eventTag: true } },
        address: true,
      },
    });

    return eventsPublic.map((event) => this.cardFormattedEvent(event));
  }
  async createSortieLoisirs(
    createEventDto: CreateEventDtoSortieLoisirs,
    userId: string,
  ) {
    if (
      createEventDto.address &&
      createEventDto.city &&
      createEventDto.zip_code
    ) {
      // Étape 1 : Créer ou récupérer l'adresse
      const address = await this.prisma.address.create({
        data: {
          address_line: createEventDto.address,
          city: createEventDto.city,
          zip_code: createEventDto.zip_code,
          location: {
            type: createEventDto.location.type,
            lat: createEventDto.location.lat,
            lng: createEventDto.location.long,
          },
        },
      });

      // Étape 2 : Créer l'événement et associer l'adresse et l'utilisateur
      const event = await this.prisma.event.create({
        data: {
          title: createEventDto.title,
          description: createEventDto.description,
          start_date: new Date(createEventDto.start_date),
          end_date: new Date(createEventDto.end_date),
          photo: createEventDto.photo,
          guest_limit: createEventDto.guest_limit,
          is_public: createEventDto.is_public,
          category: createEventDto.category,
          user: { connect: { id: userId } },
          address: { connect: { id: address.id } }, // Lier l'adresse créée à l'événement
          status: 'active',
        },
      });

      // Étape 3 : Associer les tags à l'événement (via la table de relation EventHasEventTag)
      // Étape 3 : Associer les tags existants à l'événement (via la table de relation EventHasEventTag)
      if (createEventDto.tags && createEventDto.tags.length > 0) {
        await Promise.all(
          createEventDto.tags.map(async (tagName) => {
            // Rechercher le tag dans la table EventTag
            const eventTag = await this.prisma.eventTag.findFirst({
              where: { tag: tagName },
            });

            // Si le tag existe, créer la relation dans la table de jointure
            if (eventTag) {
              await this.prisma.eventHasEventTag.create({
                data: {
                  event_id: event.id, // ID de l'événement
                  event_tag_id: eventTag.id, // ID du tag existant
                },
              });
            } else {
              console.log(`Tag non trouvé : ${tagName}`);
            }
          }),
        );
      }

      console.log('🚀 ~ EventService ~ create ~ event:', event);
      return event;
    }
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
  ): eventCard {
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
      picture:
        event.photo ||
        'https://media.istockphoto.com/id/1330261325/fr/photo/des-enfants-heureux-qui-jouent-ensemble-dans-le-parc.jpg?s=2048x2048&w=is&k=20&c=NA1H1VECjNbfYa8_1jOiGQTRR9mrHnEDO-ewLHEABmE=',
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
