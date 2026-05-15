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
import { HarvestingService } from './harvesting.service';
import { CreateHarvestingDto } from './dto/create-harvesting.dto';
import { UpdateHarvestingDto } from './dto/update-harvesting.dto';

@ApiTags('harvesting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('harvesting')
export class HarvestingController {
  constructor(private readonly harvestingService: HarvestingService) {}

  @Post()
  @ApiOperation({
    summary: 'Record a harvesting activity (2-step form submit)',
    description:
      'Accepts the full harvesting data. Sets crop currentActivity to "Harvesting" and progress to 100.',
  })
  @ApiResponse({ status: 201, description: 'Harvesting record created' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  create(@Body() dto: CreateHarvestingDto) {
    return this.harvestingService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List harvesting records for a crop + stats',
  })
  @ApiQuery({ name: 'cropId', required: true })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        records: [],
        stats: {
          count: 1,
          totalQuantityKg: 500,
          totalCost: 13000,
          lastDate: '2026-02-15T00:00:00.000Z',
        },
      },
    },
  })
  findAll(@Query('cropId') cropId: string) {
    return this.harvestingService.findAll(cropId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single harvesting record' })
  findOne(@Param('id') id: string) {
    return this.harvestingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a harvesting record' })
  update(@Param('id') id: string, @Body() dto: UpdateHarvestingDto) {
    return this.harvestingService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a harvesting record' })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Harvesting record deleted successfully' } },
  })
  remove(@Param('id') id: string) {
    return this.harvestingService.remove(id);
  }
}
