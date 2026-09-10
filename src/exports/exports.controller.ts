import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ExportsService } from './exports.service';

@ApiTags('exports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/exports')
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get('catalog')
  @ApiOperation({ summary: 'List datasets available for administrator export' })
  catalog() { return this.exportsService.catalog(); }

  @Get('all')
  @ApiOperation({ summary: 'Download all export datasets in one Excel workbook' })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  async all(@Query('from') from: string | undefined, @Query('to') to: string | undefined, @Res() response: Response) {
    const workbook = await this.exportsService.buildAllWorkbook(from, to);
    response.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="xpert-farmer-all-data-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    });
    response.send(workbook);
  }

  @Get(':dataset')
  @ApiOperation({ summary: 'Export a paginated administrator dataset' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  findAll(@Param('dataset') dataset: string, @Query('page') page?: number, @Query('limit') limit?: number, @Query('from') from?: string, @Query('to') to?: string) {
    return this.exportsService.findAll(dataset, page, limit, from, to);
  }
}
