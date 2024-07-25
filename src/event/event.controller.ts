import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';
import { AuthGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { AuthenticatedRequest } from 'src/interfaces/authRequest';
import { CardEvent } from 'src/interfaces/cardEvent';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventService } from './event.service';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get('public')
  @Roles(RoleName.PARENT) // Assumes PARENT role can access public events
  @UseGuards(RolesGuard, AuthGuard)
  async getPublicEvents(
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '10',
  ): Promise<{ events: CardEvent[]; message: string }> {
    // Validate skip and take parameters
    const { skipInt, takeInt } = this.eventService.validatePagination(
      skip,
      take,
    );
    const formattedEvents = await this.eventService.findPublicEvents(
      skipInt,
      takeInt,
    );
    return {
      events: formattedEvents,
      message: 'All public events fetched successfully',
    };
  }

  @Post()
  @Roles(RoleName.PARENT)
  @UseGuards(RolesGuard, AuthGuard)
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    await this.eventService.create(createEventDto, userId);
    return {
      status: 'success',
      message: `Successfully created event ${createEventDto.title} by ${userId}`,
    };
  }

  @Put(':id')
  @Roles(RoleName.PARENT)
  @UseGuards(RolesGuard, AuthGuard)
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const result = await this.eventService.update(id, updateEventDto, userId);

    if (!result) {
      throw new BadRequestException(
        `Event with id ${id} not found or not authorized to update`,
      );
    }

    return {
      status: 'success',
      message: `Successfully updated event with id ${id}`,
    };
  }

  @Delete(':id')
  @Roles(RoleName.PARENT)
  @UseGuards(RolesGuard, AuthGuard)
  async deleteEvent(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const result = await this.eventService.delete(id, userId);

    if (!result) {
      throw new BadRequestException(
        `Event with id ${id} not found or not authorized to delete`,
      );
    }

    return {
      status: 'success',
      message: `Successfully deleted event with id ${id}`,
    };
  }
}
