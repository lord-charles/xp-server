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
import { SoilPrepService } from './soil-prep.service';
import { CreateSoilPrepDto } from './dto/create-soil-prep.dto';
import { UpdateSoilPrepDto } from './dto/update-soil-prep.dto';

@ApiTags('soil-prep')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('soil-prep')
export class SoilPrepController {
  constructor(private readonly soilPrepService: SoilPrepService) {}

  @Post()
  @ApiOperation({
    summary:
      'Record a soil preparation activity (SoilLandPrepScreen → TillageScreen)',
  })
  @ApiResponse({ status: 201, description: 'Record created' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  create(@Body() dto: CreateSoilPrepDto) {
    return this.soilPrepService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary:
      'List soil prep records for a crop + aggregate stats for activity-dashboard',
  })
  @ApiQuery({ name: 'cropId', required: true })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        records: [],
        stats: {
          count: 4,
          totalArea: 6.3,
          totalLabourCost: 4200,
          lastDate: '2026-01-10T00:00:00.000Z',
        },
      },
    },
  })
  findAll(@Query('cropId') cropId: string) {
    return this.soilPrepService.findAll(cropId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single soil prep record' })
  @ApiResponse({ status: 404, description: 'Record not found' })
  findOne(@Param('id') id: string) {
    return this.soilPrepService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a soil prep record' })
  update(@Param('id') id: string, @Body() dto: UpdateSoilPrepDto) {
    return this.soilPrepService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a soil prep record' })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Soil prep record deleted successfully' } },
  })
  remove(@Param('id') id: string) {
    return this.soilPrepService.remove(id);
  }
}
