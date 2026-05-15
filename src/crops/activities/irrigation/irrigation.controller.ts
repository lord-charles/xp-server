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
import { IrrigationService } from './irrigation.service';
import { CreateIrrigationDto } from './dto/create-irrigation.dto';
import { UpdateIrrigationDto } from './dto/update-irrigation.dto';

@ApiTags('irrigation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('irrigation')
export class IrrigationController {
  constructor(private readonly irrigationService: IrrigationService) {}

  @Post()
  @ApiOperation({
    summary: 'Record an irrigation activity (4-step form submit)',
    description:
      'Accepts the full irrigation data. Sets crop currentActivity to "Irrigation".',
  })
  @ApiResponse({ status: 201, description: 'Irrigation record created' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  create(@Body() dto: CreateIrrigationDto) {
    return this.irrigationService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List irrigation records for a crop + stats',
  })
  @ApiQuery({ name: 'cropId', required: true })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        records: [],
        stats: {
          count: 1,
          totalVolumeLiters: 5000,
          totalCost: 19500,
          lastDate: '2026-02-15T00:00:00.000Z',
        },
      },
    },
  })
  findAll(@Query('cropId') cropId: string) {
    return this.irrigationService.findAll(cropId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single irrigation record' })
  findOne(@Param('id') id: string) {
    return this.irrigationService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an irrigation record' })
  update(@Param('id') id: string, @Body() dto: UpdateIrrigationDto) {
    return this.irrigationService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an irrigation record' })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Irrigation record deleted successfully' } },
  })
  remove(@Param('id') id: string) {
    return this.irrigationService.remove(id);
  }
}
