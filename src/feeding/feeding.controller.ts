import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FeedingService } from './feeding.service';
import { CreateFeedingDto } from './dto/create-feeding.dto';
import { CreateGrazingDto } from './dto/create-grazing.dto';
import { UpdateFeedingDto } from './dto/update-feeding.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('feeding')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('feeding')
export class FeedingController {
  constructor(private readonly feedingService: FeedingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new feeding program' })
  create(@Body() createFeedingDto: CreateFeedingDto) {
    return this.feedingService.create(createFeedingDto);
  }

  @Post('grazing')
  @ApiOperation({ summary: 'Create a new grazing record' })
  createGrazing(@Body() createGrazingDto: CreateGrazingDto) {
    return this.feedingService.createGrazing(createGrazingDto);
  }

  @Get(':farmId')
  @ApiOperation({ summary: 'Get all feeding programs for a farm' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Param('farmId') farmId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.feedingService.findAll(farmId, page, limit);
  }

  @Get('grazing/:farmId')
  @ApiOperation({ summary: 'Get all grazing records for a farm' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Filter by start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Filter by end date (YYYY-MM-DD)',
  })
  findAllGrazing(
    @Param('farmId') farmId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.feedingService.findAllGrazing(
      farmId,
      page,
      limit,
      startDate,
      endDate,
    );
  }

  @Get('grazing/:farmId/summary')
  @ApiOperation({ summary: 'Get grazing summary statistics for a farm' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Filter by start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Filter by end date (YYYY-MM-DD)',
  })
  getGrazingSummary(
    @Param('farmId') farmId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.feedingService.getGrazingSummary(farmId, startDate, endDate);
  }

  @Get('program/:id')
  @ApiOperation({ summary: 'Get a specific feeding program by its ID' })
  findOne(@Param('id') id: string) {
    return this.feedingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a feeding program' })
  update(@Param('id') id: string, @Body() updateFeedingDto: UpdateFeedingDto) {
    return this.feedingService.update(id, updateFeedingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a feeding program' })
  remove(@Param('id') id: string) {
    return this.feedingService.remove(id);
  }
}
