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
import { FieldConditionsService } from './field-conditions.service';
import { CreateFieldConditionDto } from './dto/create-field-condition.dto';
import { UpdateFieldConditionDto } from './dto/update-field-condition.dto';

@ApiTags('field-conditions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('field-conditions')
export class FieldConditionsController {
  constructor(
    private readonly fieldConditionsService: FieldConditionsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Record field conditions (FieldConditionsScreen submit)',
    description:
      'Accepts field characteristics data. Sets crop currentActivity to "Field Conditions Assessment".',
  })
  @ApiResponse({ status: 201, description: 'Field condition record created' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  create(@Body() dto: CreateFieldConditionDto) {
    return this.fieldConditionsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List field condition records for a crop + stats',
  })
  @ApiQuery({ name: 'cropId', required: true })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        records: [],
        stats: {
          count: 1,
          lastDate: '2026-02-15T00:00:00.000Z',
          topographies: ['sloped'],
          drainageTypes: ['well-drained'],
        },
      },
    },
  })
  findAll(@Query('cropId') cropId: string) {
    return this.fieldConditionsService.findAll(cropId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single field condition record' })
  findOne(@Param('id') id: string) {
    return this.fieldConditionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a field condition record' })
  update(@Param('id') id: string, @Body() dto: UpdateFieldConditionDto) {
    return this.fieldConditionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a field condition record' })
  @ApiResponse({
    status: 200,
    schema: {
      example: { message: 'Field condition record deleted successfully' },
    },
  })
  remove(@Param('id') id: string) {
    return this.fieldConditionsService.remove(id);
  }
}
