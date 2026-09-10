import { Controller, Get, Body, Patch, Param, Delete, Query, UseGuards, Post } from '@nestjs/common';
import { FarmsService } from './farms.service';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFarmDto } from './dto/create-farm.dto';

@ApiTags('farms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('farms')
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) { }

  @Post()
  @ApiOperation({
    summary: 'Create a new farm',
    description: 'Add a new farm to the system. Requires a valid userId referencing an existing user.'
  })
  @ApiBody({
    type: CreateFarmDto,
    examples: {
      kenyaExample: {
        summary: 'Kenyan Mixed Farm',
        value: {
          name: 'Kamau Mixed Farm',
          county: 'Kiambu',
          administrativeLocation: 'Kikuyu',
          size: 7.2,
          ownership: 'Freehold',
          farmingTypes: ['Dairy cattle', 'Poultry', 'Crops'],
          userId: 'cmaerl8s10000l004pmlo1f7d',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully created farm',
    schema: {
      type: 'object',
      example: {
        id: 'cmaerl8s10000l004pmlo1f7d',
        name: 'Kamau Mixed Farm',
        county: 'Kiambu',
        administrativeLocation: 'Kikuyu',
        size: 7.2,
        ownership: 'Freehold',
        farmingTypes: ['Dairy cattle', 'Poultry', 'Crops'],
        createdAt: '2025-05-19T14:00:00.000Z',
        updatedAt: '2025-05-19T14:00:00.000Z',
        user: {
          id: 'cmaerl8s10000l004pmlo1f7d',
          firstName: 'Mwangi',
          lastName: 'Kariuki',
          phoneNumber: '+254712345678',
          email: 'mwangi.kamau@example.com',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation Error' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async create(@Body() createFarmDto: CreateFarmDto) {
    return this.farmsService.create(createFarmDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all farms',
    description: 'Retrieve a paginated list of all farms with optional search'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for farm name, county, or location' })
  @ApiQuery({ name: 'createdFrom', required: false, type: String, description: 'Created date from (YYYY-MM-DD)' })
  @ApiQuery({ name: 'createdTo', required: false, type: String, description: 'Created date to (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved farms',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            example: {
              id: 'clh2x0f380001mk08x7v2p4m1',
              name: 'Kamau Mixed Farm',
              county: 'Kiambu',
              administrativeLocation: 'Kikuyu',
              size: 5.5,
              ownership: 'Freehold',
              farmingTypes: ['Dairy cattle', 'Poultry', 'Crops'],
              createdAt: '2025-05-07T17:46:51.000Z',
              updatedAt: '2025-05-07T17:46:51.000Z',
              user: {
                id: 'cmaerl8s10000l004pmlo1f7d',
                firstName: 'Mwangi',
                lastName: 'Kariuki',
                phoneNumber: '+254712345678',
                email: 'mwangi.kamau@example.com'
              }
            }
          }
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 100 },
            page: { type: 'number', example: 1 },
            pages: { type: 'number', example: 10 },
            hasNextPage: { type: 'boolean', example: true },
            hasPrevPage: { type: 'boolean', example: false }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('createdFrom') createdFrom?: string,
    @Query('createdTo') createdTo?: string,
  ) {
    return this.farmsService.findAll(page, limit, search, createdFrom, createdTo);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get farm by ID',
    description: 'Retrieve a specific farm by its ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved farm',
    schema: {
      type: 'object',
      example: {
        id: 'clh2x0f380001mk08x7v2p4m1',
        name: 'Kamau Mixed Farm',
        county: 'Kiambu',
        administrativeLocation: 'Kikuyu',
        size: 5.5,
        ownership: 'Freehold',
        farmingTypes: ['Dairy cattle', 'Poultry', 'Crops'],
        createdAt: '2025-05-07T17:46:51.000Z',
        updatedAt: '2025-05-07T17:46:51.000Z',
        owner: {
          id: 'cmaerl8s10000l004pmlo1f7d',
          firstName: 'Mwangi',
          lastName: 'Kariuki',
          phoneNumber: '+254712345678',
          email: 'mwangi.kamau@example.com'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  findOne(@Param('id') id: string) {
    return this.farmsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update farm',
    description: 'Update a farm\'s information'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated farm',
    schema: {
      type: 'object',
      example: {
        id: 'clh2x0f380001mk08x7v2p4m1',
        name: 'Kamau Mixed Farm',
        county: 'Kiambu',
        administrativeLocation: 'Kikuyu',
        size: 5.5,
        ownership: 'Freehold',
        farmingTypes: ['Dairy cattle', 'Poultry', 'Crops'],
        createdAt: '2025-05-07T17:46:51.000Z',
        updatedAt: '2025-05-07T17:46:51.000Z'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  update(@Param('id') id: string, @Body() updateFarmDto: UpdateFarmDto) {
    return this.farmsService.update(id, updateFarmDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete farm',
    description: 'Delete a farm'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted farm',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Farm deleted successfully' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  remove(@Param('id') id: string) {
    return this.farmsService.remove(id);
  }
}
