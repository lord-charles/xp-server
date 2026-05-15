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
import { CropAlertsService } from './crop-alerts.service';
import { CreateCropAlertDto } from './dto/create-crop-alert.dto';
import { UpdateCropAlertDto } from './dto/update-crop-alert.dto';

@ApiTags('crop-alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crop-alerts')
export class CropAlertsController {
  constructor(private readonly cropAlertsService: CropAlertsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a crop alert',
    description:
      'Create a new alert for a crop. Can be auto-generated or manually created.',
  })
  @ApiResponse({ status: 201, description: 'Crop alert created' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  create(@Body() dto: CreateCropAlertDto) {
    return this.cropAlertsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List crop alerts for a crop + stats',
  })
  @ApiQuery({ name: 'cropId', required: true })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        records: [],
        stats: {
          count: 5,
          unreadCount: 2,
          criticalCount: 1,
        },
      },
    },
  })
  findAll(@Query('cropId') cropId: string) {
    return this.cropAlertsService.findAll(cropId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single crop alert' })
  findOne(@Param('id') id: string) {
    return this.cropAlertsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a crop alert' })
  update(@Param('id') id: string, @Body() dto: UpdateCropAlertDto) {
    return this.cropAlertsService.update(id, dto);
  }

  @Patch(':id/mark-as-read')
  @ApiOperation({ summary: 'Mark a single alert as read' })
  markAsRead(@Param('id') id: string) {
    return this.cropAlertsService.markAsRead(id);
  }

  @Patch('mark-all-as-read')
  @ApiOperation({ summary: 'Mark all alerts for a crop as read' })
  @ApiQuery({ name: 'cropId', required: true })
  markAllAsRead(@Query('cropId') cropId: string) {
    return this.cropAlertsService.markAllAsRead(cropId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a crop alert' })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Crop alert deleted successfully' } },
  })
  remove(@Param('id') id: string) {
    return this.cropAlertsService.remove(id);
  }
}
