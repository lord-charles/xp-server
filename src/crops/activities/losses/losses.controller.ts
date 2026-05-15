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
import { LossesService } from './losses.service';
import { CreateLossDto } from './dto/create-loss.dto';
import { UpdateLossDto } from './dto/update-loss.dto';

@ApiTags('losses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('losses')
export class LossesController {
  constructor(private readonly lossesService: LossesService) {}

  @Post()
  @ApiOperation({
    summary: 'Record a crop loss',
    description:
      'Accepts the full loss data. Sets crop currentActivity to "Losses".',
  })
  @ApiResponse({ status: 201, description: 'Loss record created' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  create(@Body() dto: CreateLossDto) {
    return this.lossesService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List loss records for a crop + stats',
  })
  @ApiQuery({ name: 'cropId', required: true })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        records: [],
        stats: {
          count: 1,
          totalQuantityKg: 50,
          lastDate: '2026-02-15T00:00:00.000Z',
        },
      },
    },
  })
  findAll(@Query('cropId') cropId: string) {
    return this.lossesService.findAll(cropId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single loss record' })
  findOne(@Param('id') id: string) {
    return this.lossesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a loss record' })
  update(@Param('id') id: string, @Body() dto: UpdateLossDto) {
    return this.lossesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a loss record' })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Loss record deleted successfully' } },
  })
  remove(@Param('id') id: string) {
    return this.lossesService.remove(id);
  }
}
