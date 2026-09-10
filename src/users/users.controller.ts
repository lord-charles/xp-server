import { Controller, Get, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @ApiOperation({
    summary: 'Get all farmers',
    description: 'Retrieve a paginated list of all farmers with optional search'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for name, email, or phone' })
  @ApiQuery({ name: 'createdFrom', required: false, type: String, description: 'Created date from (YYYY-MM-DD)' })
  @ApiQuery({ name: 'createdTo', required: false, type: String, description: 'Created date to (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved farmers',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            example: {
              id: 'clh2x0f380000mk08g8hv1q2z',
              firstName: 'Mwangi',
              middleName: 'Kamau',
              lastName: 'Kariuki',
              gender: 'Male',
              ageGroup: '35-44',
              residenceCounty: 'Kiambu',
              residenceLocation: 'Kikuyu Town',
              email: 'mwangi.kamau@example.com',
              phoneNumber: '+254712345678',
              businessNumber: '+254720123456',
              yearsOfExperience: 8,
              createdAt: '2025-05-07T17:46:51.000Z',
              updatedAt: '2025-05-07T17:46:51.000Z',
              farm: {
                id: 'clh2x0f380001mk08x7v2p4m1',
                name: 'Kamau Mixed Farm',
                county: 'Kiambu',
                administrativeLocation: 'Kikuyu',
                size: 5.5,
                ownership: 'Freehold',
                farmingTypes: ['Dairy cattle', 'Poultry', 'Crops']
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
    return this.usersService.findAll(page, limit, search, createdFrom, createdTo);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get farmer by ID',
    description: 'Retrieve a specific farmer by their ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved farmer',
    schema: {
      type: 'object',
      example: {
        id: 'clh2x0f380000mk08g8hv1q2z',
        firstName: 'Mwangi',
        middleName: 'Kamau',
        lastName: 'Kariuki',
        gender: 'Male',
        ageGroup: '35-44',
        residenceCounty: 'Kiambu',
        residenceLocation: 'Kikuyu Town',
        email: 'mwangi.kamau@example.com',
        phoneNumber: '+254712345678',
        businessNumber: '+254720123456',
        yearsOfExperience: 8,
        createdAt: '2025-05-07T17:46:51.000Z',
        updatedAt: '2025-05-07T17:46:51.000Z',
        farm: {
          id: 'clh2x0f380001mk08x7v2p4m1',
          name: 'Kamau Mixed Farm',
          county: 'Kiambu',
          administrativeLocation: 'Kikuyu',
          size: 5.5,
          ownership: 'Freehold',
          farmingTypes: ['Dairy cattle', 'Poultry', 'Crops']
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farmer not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update farmer',
    description: 'Update a farmer\'s information'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated farmer',
    schema: {
      type: 'object',
      example: {
        id: 'clh2x0f380000mk08g8hv1q2z',
        firstName: 'Mwangi',
        middleName: 'Kamau',
        lastName: 'Kariuki',
        gender: 'Male',
        ageGroup: '35-44',
        residenceCounty: 'Kiambu',
        residenceLocation: 'Kikuyu Town',
        email: 'mwangi.kamau@example.com',
        phoneNumber: '+254712345678',
        businessNumber: '+254720123456',
        yearsOfExperience: 8,
        createdAt: '2025-05-07T17:46:51.000Z',
        updatedAt: '2025-05-07T17:46:51.000Z'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farmer not found' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete farmer',
    description: 'Delete a farmer and their associated farm'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted farmer',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User deleted successfully' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farmer not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
