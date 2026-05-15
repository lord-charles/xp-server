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
import { CropSalesService } from './crop-sales.service';
import { CreateCropSaleDto } from './dto/create-crop-sale.dto';
import { UpdateCropSaleDto } from './dto/update-crop-sale.dto';

@ApiTags('crop-sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crop-sales')
export class CropSalesController {
  constructor(private readonly cropSalesService: CropSalesService) {}

  @Post()
  @ApiOperation({
    summary: 'Record a crop sale',
    description:
      'Accepts the full crop sale data. Computes totalAmount = quantity * pricePerUnit. Sets crop currentActivity to "Sales".',
  })
  @ApiResponse({ status: 201, description: 'Crop sale record created' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  create(@Body() dto: CreateCropSaleDto) {
    return this.cropSalesService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List crop sale records for a crop + stats',
  })
  @ApiQuery({ name: 'cropId', required: true })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        records: [],
        stats: {
          count: 1,
          totalQuantityKg: 500,
          totalRevenue: 25000,
          averagePricePerUnit: 50,
          lastDate: '2026-02-15T00:00:00.000Z',
        },
      },
    },
  })
  findAll(@Query('cropId') cropId: string) {
    return this.cropSalesService.findAll(cropId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single crop sale record' })
  findOne(@Param('id') id: string) {
    return this.cropSalesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a crop sale record' })
  update(@Param('id') id: string, @Body() dto: UpdateCropSaleDto) {
    return this.cropSalesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a crop sale record' })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Crop sale record deleted successfully' } },
  })
  remove(@Param('id') id: string) {
    return this.cropSalesService.remove(id);
  }
}
