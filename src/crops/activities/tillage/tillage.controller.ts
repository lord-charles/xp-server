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
import { TillageService } from './tillage.service';
import { CreateTillageDto } from './dto/create-tillage.dto';
import { UpdateTillageDto } from './dto/update-tillage.dto';

@ApiTags('tillage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tillage')
export class TillageController {
  constructor(private readonly tillageService: TillageService) {}

  @Post()
  @ApiOperation({ summary: 'Record tillage operations (TillageScreen submit)' })
  @ApiResponse({ status: 201, description: 'Tillage record created' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  create(@Body() dto: CreateTillageDto) {
    return this.tillageService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List tillage records for a crop + stats' })
  @ApiQuery({ name: 'cropId', required: true })
  findAll(@Query('cropId') cropId: string) {
    return this.tillageService.findAll(cropId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single tillage record' })
  findOne(@Param('id') id: string) {
    return this.tillageService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tillage record' })
  update(@Param('id') id: string, @Body() dto: UpdateTillageDto) {
    return this.tillageService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tillage record' })
  remove(@Param('id') id: string) {
    return this.tillageService.remove(id);
  }
}
