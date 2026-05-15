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
import { DiseasesService } from './diseases.service';
import { CreateDiseaseDto } from './dto/create-disease.dto';
import { UpdateDiseaseDto } from './dto/update-disease.dto';

@ApiTags('diseases')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('diseases')
export class DiseasesController {
  constructor(private readonly diseasesService: DiseasesService) {}

  @Post()
  @ApiOperation({
    summary: 'Record a disease identification and control',
    description:
      'Accepts the full disease data. Sets crop currentActivity to "Disease Control".',
  })
  @ApiResponse({ status: 201, description: 'Disease record created' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  create(@Body() dto: CreateDiseaseDto) {
    return this.diseasesService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List disease records for a crop + stats',
  })
  @ApiQuery({ name: 'cropId', required: true })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        records: [],
        stats: {
          count: 1,
          totalLabourCost: 2500,
          lastDate: '2026-02-15T00:00:00.000Z',
        },
      },
    },
  })
  findAll(@Query('cropId') cropId: string) {
    return this.diseasesService.findAll(cropId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single disease record' })
  findOne(@Param('id') id: string) {
    return this.diseasesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a disease record' })
  update(@Param('id') id: string, @Body() dto: UpdateDiseaseDto) {
    return this.diseasesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a disease record' })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Disease record deleted successfully' } },
  })
  remove(@Param('id') id: string) {
    return this.diseasesService.remove(id);
  }
}
