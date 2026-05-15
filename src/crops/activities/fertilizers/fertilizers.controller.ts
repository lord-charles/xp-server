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
import { FertilizersService } from './fertilizers.service';
import { CreateFertilizerDto } from './dto/create-fertilizer.dto';
import { UpdateFertilizerDto } from './dto/update-fertilizer.dto';

@ApiTags('fertilizers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fertilizers')
export class FertilizersController {
  constructor(private readonly fertilizersService: FertilizersService) {}

  @Post()
  @ApiOperation({
    summary: 'Record a fertilizer application (5-step wizard submit)',
    description:
      'Accepts the full fertilizer application data. Sets crop currentActivity to "Fertilizer Application".',
  })
  @ApiResponse({ status: 201, description: 'Fertilizer record created' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  create(@Body() dto: CreateFertilizerDto) {
    return this.fertilizersService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List fertilizer records for a crop + stats',
  })
  @ApiQuery({ name: 'cropId', required: true })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        records: [],
        stats: {
          count: 1,
          totalDosageKg: 50,
          totalLabourCost: 3000,
          lastDate: '2026-02-15T00:00:00.000Z',
        },
      },
    },
  })
  findAll(@Query('cropId') cropId: string) {
    return this.fertilizersService.findAll(cropId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single fertilizer record' })
  findOne(@Param('id') id: string) {
    return this.fertilizersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a fertilizer record' })
  update(@Param('id') id: string, @Body() dto: UpdateFertilizerDto) {
    return this.fertilizersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a fertilizer record' })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Fertilizer record deleted successfully' } },
  })
  remove(@Param('id') id: string) {
    return this.fertilizersService.remove(id);
  }
}
