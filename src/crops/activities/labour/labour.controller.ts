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
import { LabourService } from './labour.service';
import { CreateLabourDto } from './dto/create-labour.dto';
import { UpdateLabourDto } from './dto/update-labour.dto';

@ApiTags('labour')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('labour')
export class LabourController {
  constructor(private readonly labourService: LabourService) {}

  @Post()
  @ApiOperation({
    summary: 'Record labour activity',
    description:
      'Create a labour record for machine, animal, and/or human labour used in farming activities.',
  })
  @ApiResponse({ status: 201, description: 'Labour record created' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  create(@Body() dto: CreateLabourDto) {
    return this.labourService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List labour records for a crop + stats',
    description: 'Get all labour records and aggregated statistics',
  })
  @ApiQuery({ name: 'cropId', required: true })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        records: [],
        stats: {
          count: 3,
          totalCost: 4700,
          totalHours: 13,
          machineEntries: 1,
          animalEntries: 1,
          humanEntries: 1,
          costBreakdown: { machine: 2000, animal: 1500, human: 1200 },
          hoursBreakdown: { machine: 4, animal: 3, human: 6 },
        },
      },
    },
  })
  findAll(@Query('cropId') cropId: string) {
    return this.labourService.findAll(cropId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single labour record' })
  findOne(@Param('id') id: string) {
    return this.labourService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a labour record' })
  update(@Param('id') id: string, @Body() dto: UpdateLabourDto) {
    return this.labourService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a labour record' })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Labour record deleted successfully' } },
  })
  remove(@Param('id') id: string) {
    return this.labourService.remove(id);
  }
}
