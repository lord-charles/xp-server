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
import { PlantingService } from './planting.service';
import { CreatePlantingDto } from './dto/create-planting.dto';
import { UpdatePlantingDto } from './dto/update-planting.dto';

@ApiTags('planting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('planting')
export class PlantingController {
  constructor(private readonly plantingService: PlantingService) {}

  @Post()
  @ApiOperation({
    summary: 'Record a planting activity (PlantingScreen 3-step wizard submit)',
    description:
      'Accepts the full PlantingFormData from all 3 steps. Sets crop progress to 10% and currentActivity to "Planting".',
  })
  @ApiResponse({ status: 201, description: 'Planting record created' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  create(@Body() dto: CreatePlantingDto) {
    return this.plantingService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List planting records for a crop + stats for activity-dashboard',
  })
  @ApiQuery({ name: 'cropId', required: true })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        records: [],
        stats: {
          count: 1,
          totalSeedsKg: 12,
          totalLabourCost: 3000,
          lastDate: '2026-01-15T00:00:00.000Z',
        },
      },
    },
  })
  findAll(@Query('cropId') cropId: string) {
    return this.plantingService.findAll(cropId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single planting record' })
  findOne(@Param('id') id: string) {
    return this.plantingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a planting record' })
  update(@Param('id') id: string, @Body() dto: UpdatePlantingDto) {
    return this.plantingService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a planting record' })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Planting record deleted successfully' } },
  })
  remove(@Param('id') id: string) {
    return this.plantingService.remove(id);
  }
}
