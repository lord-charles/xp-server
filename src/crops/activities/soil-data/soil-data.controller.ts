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
import { SoilDataService } from './soil-data.service';
import { CreateSoilDataDto } from './dto/create-soil-data.dto';
import { UpdateSoilDataDto } from './dto/update-soil-data.dto';

@ApiTags('soil-data')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('soil-data')
export class SoilDataController {
  constructor(private readonly soilDataService: SoilDataService) {}

  @Post()
  @ApiOperation({
    summary: 'Record soil data (SoilDataScreen submit)',
    description:
      'Accepts soil characteristics data. Sets crop currentActivity to "Soil Data Collection".',
  })
  @ApiResponse({ status: 201, description: 'Soil data record created' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  create(@Body() dto: CreateSoilDataDto) {
    return this.soilDataService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List soil data records for a crop + stats',
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
          soilTypes: ['loamy'],
          phLevels: ['neutral'],
        },
      },
    },
  })
  findAll(@Query('cropId') cropId: string) {
    return this.soilDataService.findAll(cropId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single soil data record' })
  findOne(@Param('id') id: string) {
    return this.soilDataService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a soil data record' })
  update(@Param('id') id: string, @Body() dto: UpdateSoilDataDto) {
    return this.soilDataService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a soil data record' })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Soil data record deleted successfully' } },
  })
  remove(@Param('id') id: string) {
    return this.soilDataService.remove(id);
  }
}
