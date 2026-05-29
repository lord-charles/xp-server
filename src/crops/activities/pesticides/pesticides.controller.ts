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
import { PesticidesService } from './pesticides.service';
import { CreatePesticideDto } from './dto/create-pesticide.dto';
import { UpdatePesticideDto } from './dto/update-pesticide.dto';

@ApiTags('pesticides')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pesticides')
export class PesticidesController {
  constructor(private readonly pesticidesService: PesticidesService) {}

  @Post()
  @ApiOperation({
    summary: 'Record a pesticide application',
    description:
      'Accepts the full pesticide application data. Sets crop currentActivity to "Pesticide Application".',
  })
  @ApiResponse({ status: 201, description: 'Pesticide record created' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  create(@Body() dto: CreatePesticideDto) {
    return this.pesticidesService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List pesticide records for a crop + stats',
  })
  @ApiQuery({ name: 'cropId', required: true })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        records: [],
        stats: {
          count: 1,
          totalLabourCost: 2000,
          totalCost: 4500,
          lastDate: '2026-02-15T00:00:00.000Z',
        },
      },
    },
  })
  findAll(@Query('cropId') cropId: string) {
    return this.pesticidesService.findAll(cropId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single pesticide record' })
  findOne(@Param('id') id: string) {
    return this.pesticidesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a pesticide record' })
  update(@Param('id') id: string, @Body() dto: UpdatePesticideDto) {
    return this.pesticidesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pesticide record' })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Pesticide record deleted successfully' } },
  })
  remove(@Param('id') id: string) {
    return this.pesticidesService.remove(id);
  }
}
