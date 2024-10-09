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
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';
import { AuthGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { AuthenticatedRequest } from 'src/interfaces/authRequest';
import { eventCard } from 'src/interfaces/EventCard';
import { PaginatorUtils } from 'src/utils/paginator.utils';
import { ResponseWithoutDataInterface } from 'src/utils/response.utils';
import { CreateEventDtoSortieLoisirs } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventService } from './event.service';

@Controller('event')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly paginatorUtil: PaginatorUtils,
  ) {}

  @Get('public')
  @Roles(RoleName.PARENT)
  @UseGuards(RolesGuard)
  async getPublicEvents(
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '10',
  ): Promise<{ events: eventCard[]; message: string }> {
    // Validate skip and take parameters
    return {
      events: await this.eventService.findPublicEvents(
        this.paginatorUtil.validate(skip, take),
      ),
      message: 'All public events fetched successfully',
    };
  }

  @Get('my_events')
  @Roles(RoleName.PARENT)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard)
  async getMyEvents(
    @Request() req: any,
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '10',
  ): Promise<{ events: eventCard[]; message: string }> {
    const userId = req.user.sub;
    console.log('🚀 ~ EventController ~ userId:', userId);

    if (!userId) {
      throw new BadRequestException('User ID not found in request');
    }
    // Validate skip and take parameters
    return {
      events: await this.eventService.findMyEvents(
        this.paginatorUtil.validate(skip, take),
        req.user.sub,
      ),
      message: 'All my events fetched successfully',
    };
  }
  @Get('my_participation')
  @Roles(RoleName.PARENT)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard)
  async getMyParticiptions(
    @Request() req: any,
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '10',
  ): Promise<{ events: eventCard[]; message: string }> {
    const userId = req.user.sub;
    console.log('🚀 ~ EventController ~ userId:', userId);

    if (!userId) {
      throw new BadRequestException('User ID not found in request');
    }
    // Validate skip and take parameters
    return {
      events: await this.eventService.findMyParticipations(
        this.paginatorUtil.validate(skip, take),
        req.user.sub,
      ),
      message: 'All my events fetched successfully',
    };
  }

  @Post()
  @Roles(RoleName.PARENT)
  @UseGuards(RolesGuard, AuthGuard)
  async createEvent(
    @Body() createEventDto: CreateEventDtoSortieLoisirs,
    @Request() req: AuthenticatedRequest,
  ): Promise<ResponseWithoutDataInterface> {
    const userId = req.user?.sub;
    console.log('🚀 ~ EventController ~ createEvent ~ userId:', req.user);
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    await this.eventService.createSortieLoisirs(createEventDto, userId);
    return {
      status: 'success',
      message: `Successfully created event ${createEventDto.title} by ${userId}`,
    };
  }
  @Put(':id')
  @Roles(RoleName.PARENT)
  @UseGuards(AuthGuard, RolesGuard)
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ResponseWithoutDataInterface> {
    console.log(req.user.sub);
    const result = await this.eventService.update(
      id,
      updateEventDto,
      req.user.sub,
    );

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
  @UseGuards(AuthGuard, RolesGuard)
  async deleteEvent(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ResponseWithoutDataInterface> {
    const result = await this.eventService.delete(id, req.user.sub);
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
