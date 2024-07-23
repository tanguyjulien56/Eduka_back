import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import { RoleName } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';
import { AuthGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { FormattedEvent } from 'src/interfaces/formatted-event.interface';
import { EventService } from './event.service';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  @Roles(RoleName.PARENT)
  @UseGuards(RolesGuard, AuthGuard)
  async getPublicEvents(
    @Request() req: any,
    @Query('skip') skip = '0',
    @Query('take') take = '10',
  ): Promise<{ events: FormattedEvent[]; message: string }> {
    const userId = req.user?.sub;

    if (!userId) {
      throw new BadRequestException(
        'User ID not found or user not authenticated',
      );
    }

    const skipInt = parseInt(skip, 10);
    const takeInt = parseInt(take, 10);

    const formattedEvents = await this.eventService.findPublicEventsFormatted(
      skipInt,
      takeInt,
    );

    return { events: formattedEvents, message: 'all events public' };
  }

  @Get()
  @Roles(RoleName.PARENT)
  @UseGuards(RolesGuard, AuthGuard)
  async getUserEvents(
    @Request() req: any,
    @Query('skip') skip = '0',
    @Query('take') take = '10',
  ): Promise<{ events: FormattedEvent[]; message: string }> {
    const userId = req.user?.sub;

    if (!userId) {
      throw new BadRequestException(
        'User ID not found or user not authenticated',
      );
    }

    const skipInt = parseInt(skip, 10);
    const takeInt = parseInt(take, 10);

    const formattedEvents = await this.eventService.findPublicEventsFormatted(
      skipInt,
      takeInt,
    );

    return { events: formattedEvents, message: 'all events public' };
  }
}
