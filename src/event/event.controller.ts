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
import { PaginatorUtils } from 'src/utils/paginator.utils';
import { ResponseWithoutDataInterface } from 'src/utils/response.utils';
import { CreateEventDto } from './dto/create-event.dto';
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
  ): Promise<{ events: CardEvent[]; message: string }> {
    // Validate skip and take parameters
    return {
      events: await this.eventService.findPublicEvents(
        this.paginatorUtil.validate(skip, take),
      ),
      message: 'All public events fetched successfully',
    };
  }

  @Post()
  @Roles(RoleName.PARENT)
  @UseGuards(RolesGuard)
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ResponseWithoutDataInterface> {
    await this.eventService.create(createEventDto, req.user.sub);
    return {
      status: 'success',
      message: `Successfully created event ${createEventDto.title} by ${req.user.sub}`,
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
