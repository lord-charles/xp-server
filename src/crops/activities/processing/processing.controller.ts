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
import { ProcessingService } from './processing.service';
import { CreateProcessingDto } from './dto/create-processing.dto';
import { UpdateProcessingDto } from './dto/update-processing.dto';

@ApiTags('processing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('processing')
export class ProcessingController {
  constructor(private readonly processingService: ProcessingService) {}

  @Post()
  @ApiOperation({
    summary: 'Record a processing activity (3-step form submit)',
    description:
      'Accepts the full processing data. Sets crop currentActivity to "Processing".',
  })
  @ApiResponse({ status: 201, description: 'Processing record created' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  create(@Body() dto: CreateProcessingDto) {
    return this.processingService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List processing records for a crop + stats',
  })
  @ApiQuery({ name: 'cropId', required: true })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        records: [],
        stats: {
          count: 1,
          totalOutputQuantityKg: 450,
          totalLabourCost: 4000,
          lastDate: '2026-02-15T00:00:00.000Z',
        },
      },
    },
  })
  findAll(@Query('cropId') cropId: string) {
    return this.processingService.findAll(cropId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single processing record' })
  findOne(@Param('id') id: string) {
    return this.processingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a processing record' })
  update(@Param('id') id: string, @Body() dto: UpdateProcessingDto) {
    return this.processingService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a processing record' })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Processing record deleted successfully' } },
  })
  remove(@Param('id') id: string) {
    return this.processingService.remove(id);
  }
}
