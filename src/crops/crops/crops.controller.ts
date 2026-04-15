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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CropsService } from './crops.service';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';

@ApiTags('crops')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crops')
export class CropsController {
  constructor(private readonly cropsService: CropsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a crop to a cycle (CropSelectionScreen save)' })
  @ApiResponse({
    status: 201,
    description: 'Crop created',
    schema: {
      example: {
        id: 'clx2def',
        cycleId: 'clx1abc',
        farmId: 'clh2x0f3',
        cropName: 'Maize',
        category: 'cereal',
        variety: 'Hybrid 614',
        areaSize: 2.5,
        areaUnit: 'acres',
        plantingDate: '15/02/2026',
        expectedHarvestDate: '15/06/2026',
        status: 'Active',
        progress: 0,
        currentActivity: 'Land Preparation',
        icon: '🌽',
        color: '#FFA726',
        createdAt: '2026-02-15T00:00:00.000Z',
        updatedAt: '2026-02-15T00:00:00.000Z',
      },
    },
  })
  create(@Body() dto: CreateCropDto) {
    return this.cropsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary:
      'List crops for a cycle — powers the crop grid on the index screen',
    description:
      'Supports filtering by status, full-text search (name/variety/activity), sort, and pagination (default limit=4 matching ITEMS_PER_PAGE)',
  })
  @ApiQuery({ name: 'cycleId', required: true })
  @ApiQuery({ name: 'farmId', required: false })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['All', 'Active', 'Complete'],
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search cropName, variety, currentActivity',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['name', 'progress', 'area', 'harvest'],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Default 4',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        data: [
          {
            id: 'clx2def',
            cropName: 'Maize',
            variety: 'Hybrid 614',
            areaSize: 2.5,
            areaUnit: 'acres',
            status: 'Active',
            progress: 75,
            currentActivity: 'Fertilizer Application',
            icon: '🌽',
            color: '#FFA726',
          },
        ],
        meta: {
          total: 4,
          page: 1,
          pages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    },
  })
  findAll(
    @Query('cycleId') cycleId: string,
    @Query('farmId') farmId?: string,
    @Query('status') status?: 'All' | 'Active' | 'Complete',
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'name' | 'progress' | 'area' | 'harvest',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.cropsService.findAll({
      cycleId,
      farmId,
      status,
      search,
      sortBy,
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get crop detail (crop detail screen /(screens)/crops/[id])',
  })
  @ApiResponse({ status: 200, description: 'Crop record' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  findOne(@Param('id') id: string) {
    return this.cropsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update crop (progress, currentActivity, status)' })
  @ApiResponse({ status: 200, description: 'Updated crop' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  update(@Param('id') id: string, @Body() dto: UpdateCropDto) {
    return this.cropsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a crop' })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Crop deleted successfully' } },
  })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  remove(@Param('id') id: string) {
    return this.cropsService.remove(id);
  }
}
