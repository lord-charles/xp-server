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
import { PestsService } from './pests.service';
import { CreatePestDto } from './dto/create-pest.dto';
import { UpdatePestDto } from './dto/update-pest.dto';

@ApiTags('pests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pests')
export class PestsController {
  constructor(private readonly pestsService: PestsService) {}

  @Post()
  @ApiOperation({
    summary: 'Record a pest identification and control',
    description:
      'Accepts the full pest data. Sets crop currentActivity to "Pest Control".',
  })
  @ApiResponse({ status: 201, description: 'Pest record created' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  create(@Body() dto: CreatePestDto) {
    return this.pestsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List pest records for a crop + stats',
  })
  @ApiQuery({ name: 'cropId', required: true })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        records: [],
        stats: {
          count: 1,
          totalLabourCost: 3000,
          lastDate: '2026-02-15T00:00:00.000Z',
        },
      },
    },
  })
  findAll(@Query('cropId') cropId: string) {
    return this.pestsService.findAll(cropId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single pest record' })
  findOne(@Param('id') id: string) {
    return this.pestsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a pest record' })
  update(@Param('id') id: string, @Body() dto: UpdatePestDto) {
    return this.pestsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pest record' })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Pest record deleted successfully' } },
  })
  remove(@Param('id') id: string) {
    return this.pestsService.remove(id);
  }
}
