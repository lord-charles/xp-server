import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { WeatherDataService } from './weather-data.service';
import { CreateWeatherDataDto } from './dto/create-weather-data.dto';
import { UpdateWeatherDataDto } from './dto/update-weather-data.dto';

@ApiTags('weather-data')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('weather-data')
export class WeatherDataController {
  constructor(private readonly weatherDataService: WeatherDataService) {}

  @Post()
  @ApiOperation({
    summary: 'Record weather data (WeatherDataScreen submit)',
    description:
      'Accepts weather characteristics data. Sets crop currentActivity to "Weather Data Collection".',
  })
  @ApiResponse({ status: 201, description: 'Weather data record created' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  create(@Body() dto: CreateWeatherDataDto) {
    return this.weatherDataService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List weather data records for a crop + stats',
  })
  @ApiQuery({ name: 'cropId', required: true })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        records: [],
        stats: {
          count: 1,
          lastDate: '2026-02-15T00:00:00.000Z',
          avgTemperature: '25.5',
          totalPrecipitation: 15.2,
          avgHumidity: '65.0',
        },
      },
    },
  })
  findAll(@Query('cropId') cropId: string) {
    return this.weatherDataService.findAll(cropId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single weather data record' })
  findOne(@Param('id') id: string) {
    return this.weatherDataService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a weather data record' })
  update(@Param('id') id: string, @Body() dto: UpdateWeatherDataDto) {
    return this.weatherDataService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a weather data record' })
  @ApiResponse({
    status: 200,
    schema: {
      example: { message: 'Weather data record deleted successfully' },
    },
  })
  remove(@Param('id') id: string) {
    return this.weatherDataService.remove(id);
  }
}
