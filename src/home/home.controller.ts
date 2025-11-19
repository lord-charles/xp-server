import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HomeService } from './home.service';

@ApiTags('home')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get aggregated dashboard summary for a farm' })
  @ApiQuery({ name: 'farmId', required: true, type: String, description: 'Farm ID' })
  async getSummary(@Query('farmId') farmId: string) {
    return this.homeService.getSummary(farmId);
    }
}
