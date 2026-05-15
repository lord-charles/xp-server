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
import { ChemicalsService } from './chemicals.service';
import { CreateChemicalDto } from './dto/create-chemical.dto';
import { UpdateChemicalDto } from './dto/update-chemical.dto';

@ApiTags('chemicals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chemicals')
export class ChemicalsController {
  constructor(private readonly chemicalsService: ChemicalsService) {}

  @Post()
  @ApiOperation({
    summary: 'Record a chemical application',
    description:
      'Accepts the full chemical application data. Sets crop currentActivity to "Chemical Application".',
  })
  @ApiResponse({ status: 201, description: 'Chemical record created' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  create(@Body() dto: CreateChemicalDto) {
    return this.chemicalsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List chemical records for a crop + stats',
  })
  @ApiQuery({ name: 'cropId', required: true })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        records: [],
        stats: {
          count: 1,
          totalDosageLiters: 1.5,
          totalLabourCost: 2500,
          lastDate: '2026-02-15T00:00:00.000Z',
        },
      },
    },
  })
  findAll(@Query('cropId') cropId: string) {
    return this.chemicalsService.findAll(cropId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single chemical record' })
  findOne(@Param('id') id: string) {
    return this.chemicalsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a chemical record' })
  update(@Param('id') id: string, @Body() dto: UpdateChemicalDto) {
    return this.chemicalsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a chemical record' })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Chemical record deleted successfully' } },
  })
  remove(@Param('id') id: string) {
    return this.chemicalsService.remove(id);
  }
}
