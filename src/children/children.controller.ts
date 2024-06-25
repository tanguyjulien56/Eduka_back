import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { AuthGuard } from 'src/guards/jwt.guard';

@Controller('children')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @UseGuards(AuthGuard)
  @Get('search')
  async searchChildren(@Query('q') query: string) {
    const results = await this.childrenService.searchChildren(query);
    return { children: results };
  }
}
