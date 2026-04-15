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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CyclesService } from './cycles.service';
import { CreateCycleDto } from './dto/create-cycle.dto';
import { UpdateCycleDto } from './dto/update-cycle.dto';

@ApiTags('crop-cycles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cycles')
export class CyclesController {
  constructor(private readonly cyclesService: CyclesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new crop cycle (step 1 of add-crop flow)',
  })
  @ApiResponse({
    status: 201,
    description: 'Cycle created',
    schema: {
      example: {
        id: 'clx1abc',
        farmId: 'clh2x0f3',
        name: 'Dry Season 2026',
        startDate: '01/02/2026',
        endDate: '30/06/2026',
        landSelection: 'input',
        landSize: 2.5,
        landUnit: 'acres',
        status: 'Active',
        createdAt: '2026-02-01T00:00:00.000Z',
        updatedAt: '2026-02-01T00:00:00.000Z',
      },
    },
  })
  create(@Body() dto: CreateCycleDto) {
    return this.cyclesService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all cycles for a farm (cycle selector on index screen)',
  })
  @ApiQuery({ name: 'farmId', required: true, description: 'Farm ID' })
  @ApiResponse({
    status: 200,
    description: 'List of cycles with computed stats',
    schema: {
      example: [
        {
          id: 'c3',
          name: 'Dry Season 2026',
          startDate: '01/02/2026',
          endDate: '30/06/2026',
          status: 'Active',
          landSize: 5.3,
          landUnit: 'acres',
          stats: {
            activeCount: 4,
            completeCount: 0,
            totalCrops: 4,
            totalAcres: 4.3,
            avgProgress: 52,
          },
        },
      ],
    },
  })
  findAll(@Query('farmId') farmId: string) {
    return this.cyclesService.findAll(farmId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single cycle with stats' })
  @ApiResponse({ status: 200, description: 'Cycle with stats' })
  @ApiResponse({ status: 404, description: 'Cycle not found' })
  findOne(@Param('id') id: string) {
    return this.cyclesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update cycle (rename, change dates, mark complete)',
  })
  @ApiResponse({ status: 200, description: 'Updated cycle' })
  @ApiResponse({ status: 404, description: 'Cycle not found' })
  update(@Param('id') id: string, @Body() dto: UpdateCycleDto) {
    return this.cyclesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a cycle and all its crops' })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Cycle deleted successfully' } },
  })
  @ApiResponse({ status: 404, description: 'Cycle not found' })
  remove(@Param('id') id: string) {
    return this.cyclesService.remove(id);
  }
}
