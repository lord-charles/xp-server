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
import { WeedingService } from './weeding.service';
import { CreateWeedingDto } from './dto/create-weeding.dto';
import { UpdateWeedingDto } from './dto/update-weeding.dto';

@ApiTags('weeding')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('weeding')
export class WeedingController {
  constructor(private readonly weedingService: WeedingService) {}

  @Post()
  @ApiOperation({
    summary: 'Record a weeding activity (2-section form submit)',
    description:
      'Accepts the full weeding data. Sets crop currentActivity to "Weeding".',
  })
  @ApiResponse({ status: 201, description: 'Weeding record created' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  create(@Body() dto: CreateWeedingDto) {
    return this.weedingService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List weeding records for a crop + stats',
  })
  @ApiQuery({ name: 'cropId', required: true })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        records: [],
        stats: {
          count: 1,
          totalLabourCost: 4000,
          lastDate: '2026-02-15T00:00:00.000Z',
        },
      },
    },
  })
  findAll(@Query('cropId') cropId: string) {
    return this.weedingService.findAll(cropId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single weeding record' })
  findOne(@Param('id') id: string) {
    return this.weedingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a weeding record' })
  update(@Param('id') id: string, @Body() dto: UpdateWeedingDto) {
    return this.weedingService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a weeding record' })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Weeding record deleted successfully' } },
  })
  remove(@Param('id') id: string) {
    return this.weedingService.remove(id);
  }
}
