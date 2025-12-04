import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  ParseFloatPipe,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import {
  CreateSaleListingDto,
  SaleStatus,
} from './dto/create-sale-listing.dto';
import { UpdateSaleListingDto } from './dto/update-sale-listing.dto';
import { CompleteSaleDto } from './dto/complete-sale.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new sale listing',
    description:
      'Create a new livestock sale listing with detailed information',
  })
  @ApiBody({
    type: CreateSaleListingDto,
    examples: {
      dairyCattle: {
        summary: 'Dairy Cattle Sale',
        description:
          'Example of a dairy cattle sale listing with milk production details',
        value: {
          farmId: 'cmbduehjf0003l8048w6lbxxt',
          name: 'Holstein Friesian #A234',
          category: 'dairyCattle',
          breed: 'Holstein Friesian',
          age: '3 years',
          weight: 650,
          price: 85000,
          status: 'available',
          health: 'excellent',
          lastCheckup: '2025-09-15',
          purpose: 'Milk Production',
          milkProduction: '25 L/day',
          pregnancyStatus: 'Not Pregnant',
          feedingProgram: 'Intensive Feeding',
          notes:
            'Excellent breeding stock with good genetics and high milk yield',
          images: [
            'https://example.com/holstein1.jpg',
            'https://example.com/holstein2.jpg',
          ],
        },
      },
      beefCattle: {
        summary: 'Beef Cattle Sale',
        description:
          'Example of a beef cattle sale listing for meat production',
        value: {
          farmId: 'cmbduehjf0003l8048w6lbxxt',
          name: 'Angus Bull #A234',
          category: 'beefCattle',
          breed: 'Angus',
          age: '2.5 years',
          weight: 850,
          price: 120000,
          status: 'available',
          health: 'excellent',
          lastCheckup: '2025-09-15',
          purpose: 'Meat Production',
          feedingProgram: 'Intensive Feeding',
          notes: 'Prime beef cattle with excellent marbling and weight gain',
          images: ['https://example.com/angus1.jpg'],
        },
      },
      swine: {
        summary: 'Swine Sale',
        description:
          'Example of a swine sale listing for breeding or meat production',
        value: {
          farmId: 'cmbduehjf0003l8048w6lbxxt',
          name: 'Yorkshire Gilt #Y001',
          category: 'swine',
          breed: 'Yorkshire',
          age: '8 months',
          weight: 110,
          price: 35000,
          status: 'available',
          health: 'excellent',
          lastCheckup: '2025-09-15',
          purpose: 'Breeding',
          feedingProgram: 'Commercial Feed',
          notes: 'Excellent breeding gilt with good genetics and growth rate',
          images: ['https://example.com/yorkshire1.jpg'],
        },
      },
      layerPoultry: {
        summary: 'Layer Poultry Sale',
        description:
          'Example of layer poultry sale with egg production details',
        value: {
          farmId: 'cmbduehjf0003l8048w6lbxxt',
          name: 'Layer Batch #L001',
          category: 'poultry',
          breed: 'Rhode Island Red',
          age: '6 months',
          weight: 2.5,
          price: 25000,
          quantity: 50,
          pricePerBird: 500,
          status: 'available',
          health: 'excellent',
          lastCheckup: '2025-09-20',
          purpose: 'Egg Production',
          eggProductionRate: '85%',
          feedingProgram: 'Layer Feed',
          notes: 'High-producing layers with consistent egg laying rate',
          images: ['https://example.com/layers1.jpg'],
        },
      },
      broilerPoultry: {
        summary: 'Broiler Poultry Sale',
        description: 'Example of broiler poultry sale for meat production',
        value: {
          farmId: 'cmbduehjf0003l8048w6lbxxt',
          name: 'Broiler Batch #B023',
          category: 'poultry',
          breed: 'Cobb 500',
          age: '6 weeks',
          weight: 2.2,
          price: 45000,
          quantity: 100,
          pricePerBird: 450,
          status: 'available',
          health: 'excellent',
          lastCheckup: '2025-09-25',
          purpose: 'Meat Production',
          feedingProgram: 'Broiler Starter',
          notes: 'Fast-growing broilers ready for market',
          images: ['https://example.com/broilers1.jpg'],
        },
      },
      dairyGoats: {
        summary: 'Dairy Goats Sale',
        description: 'Example of dairy goats sale with milk production details',
        value: {
          farmId: 'cmbduehjf0003l8048w6lbxxt',
          name: 'Dairy Herd #DH001',
          category: 'dairyGoats',
          breed: 'Saanen',
          age: '2 years',
          weight: 65,
          price: 120000,
          quantity: 15,
          status: 'available',
          health: 'excellent',
          lastCheckup: '2025-09-20',
          purpose: 'Milk Production',
          milkProductionRate: '3.5 L/day',
          feedingProgram: 'Dairy Concentrate',
          notes: 'High-producing dairy goats with excellent milk quality',
          images: ['https://example.com/saanen1.jpg'],
        },
      },
      meatGoats: {
        summary: 'Meat Goats Sale',
        description: 'Example of meat goats sale for meat production',
        value: {
          farmId: 'cmbduehjf0003l8048w6lbxxt',
          name: 'Meat Batch #MB023',
          category: 'meatGoats',
          breed: 'Boer',
          age: '8 months',
          weight: 35,
          price: 150000,
          quantity: 25,
          status: 'available',
          health: 'excellent',
          lastCheckup: '2025-09-25',
          purpose: 'Meat Production',
          feedingProgram: 'Growth Formula',
          notes: 'Fast-growing meat goats with excellent weight gain',
          images: ['https://example.com/boer1.jpg'],
        },
      },
      woolSheep: {
        summary: 'Wool Sheep Sale',
        description: 'Example of wool sheep sale with wool production details',
        value: {
          farmId: 'cmbduehjf0003l8048w6lbxxt',
          name: 'Wool Flock #WF001',
          category: 'sheep',
          breed: 'Merino',
          age: '2 years',
          weight: 65,
          price: 240000,
          quantity: 30,
          status: 'available',
          health: 'excellent',
          lastCheckup: '2025-09-20',
          purpose: 'Wool Production',
          woolYield: '5.5 kg/year',
          feedingProgram: 'Premium Grazing',
          notes: 'High-quality wool sheep with excellent fleece production',
          images: ['https://example.com/merino1.jpg'],
        },
      },
      meatSheep: {
        summary: 'Meat Sheep Sale',
        description: 'Example of meat sheep sale for meat production',
        value: {
          farmId: 'cmbduehjf0003l8048w6lbxxt',
          name: 'Meat Flock #MF023',
          category: 'sheep',
          breed: 'Dorper',
          age: '10 months',
          weight: 45,
          price: 280000,
          quantity: 40,
          status: 'available',
          health: 'excellent',
          lastCheckup: '2025-09-25',
          purpose: 'Meat Production',
          feedingProgram: 'Fattening Mix',
          notes: 'Fast-growing meat sheep with excellent carcass quality',
          images: ['https://example.com/dorper1.jpg'],
        },
      },
      rabbits: {
        summary: 'Rabbits Sale',
        description: 'Example of rabbit sale for meat production or breeding',
        value: {
          farmId: 'cmbduehjf0003l8048w6lbxxt',
          name: 'New Zealand White #NZ001',
          category: 'rabbits',
          breed: 'New Zealand White',
          age: '6 months',
          weight: 4.5,
          price: 2500,
          status: 'available',
          health: 'excellent',
          lastCheckup: '2025-09-15',
          purpose: 'Meat Production',
          feedingProgram: 'Pellets & Hay',
          notes: 'Healthy breeding stock with good growth rate',
          images: ['https://example.com/rabbit1.jpg'],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully created sale listing',
  })
  @ApiResponse({ status: 400, description: 'Validation Error' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  create(@Body() createSaleListingDto: CreateSaleListingDto) {
    return this.salesService.create(createSaleListingDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all sale listings',
    description:
      'Retrieve paginated list of sale listings with filtering options',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term for name, breed, or category',
  })
  @ApiQuery({
    name: 'farmId',
    required: false,
    type: String,
    description: 'Filter by farm ID',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Filter by livestock category',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by sale status (available, reserved, sold)',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Minimum price filter',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Maximum price filter',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Sort by field (createdAt, price, name, weight)',
    enum: ['createdAt', 'price', 'name', 'weight'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    description: 'Sort order (asc, desc)',
    enum: ['asc', 'desc'],
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved sale listings',
  })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
    @Query('farmId') farmId?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('minPrice', new ParseFloatPipe({ optional: true }))
    minPrice?: number,
    @Query('maxPrice', new ParseFloatPipe({ optional: true }))
    maxPrice?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.salesService.findAll(
      page,
      limit,
      search,
      farmId,
      category,
      status,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
    );
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Get sales statistics',
    description: 'Get overview statistics for sales listings',
  })
  @ApiQuery({
    name: 'farmId',
    required: false,
    type: String,
    description: 'Filter statistics by farm ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved sales statistics',
  })
  getStatistics(@Query('farmId') farmId?: string) {
    return this.salesService.getSalesStatistics(farmId);
  }

  @Get('recent')
  @ApiOperation({
    summary: 'Get recent sales',
    description: 'Get recently completed sales',
  })
  @ApiQuery({
    name: 'farmId',
    required: false,
    type: String,
    description: 'Filter by farm ID',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of recent sales to retrieve (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved recent sales',
  })
  getRecentSales(
    @Query('farmId') farmId?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.salesService.getRecentSales(farmId, limit);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get sale listing by ID',
    description: 'Retrieve a specific sale listing with farm and owner details',
  })
  @ApiParam({ name: 'id', description: 'Sale listing ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved sale listing',
  })
  @ApiResponse({ status: 404, description: 'Sale listing not found' })
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update sale listing',
    description: 'Update a sale listing information',
  })
  @ApiParam({ name: 'id', description: 'Sale listing ID' })
  @ApiBody({
    type: UpdateSaleListingDto,
    examples: {
      updatePrice: {
        summary: 'Update Price',
        description: 'Update the price of a sale listing',
        value: {
          price: 90000,
          notes: 'Price updated due to market conditions and increased demand',
        },
      },
      updateStatus: {
        summary: 'Update Status to Reserved',
        description: 'Mark a sale listing as reserved',
        value: {
          status: 'reserved',
          notes: 'Reserved for potential buyer - pending final inspection',
        },
      },
      updateHealthInfo: {
        summary: 'Update Health Information',
        description: 'Update health status and checkup information',
        value: {
          health: 'good',
          lastCheckup: '2025-10-01',
          notes: 'Recent health checkup completed - minor issues addressed',
        },
      },
      updatePoultryQuantity: {
        summary: 'Update Poultry Quantity',
        description:
          'Update quantity and recalculate price per bird for poultry',
        value: {
          quantity: 45,
          price: 22500,
          notes:
            'Quantity reduced due to natural mortality - price adjusted accordingly',
        },
      },
      updateDairyProduction: {
        summary: 'Update Dairy Production',
        description: 'Update milk production information for dairy cattle',
        value: {
          milkProduction: '28 L/day',
          pregnancyStatus: 'Pregnant (3 months)',
          notes: 'Milk production increased after improved feeding program',
        },
      },
      updateBreedingInfo: {
        summary: 'Update Breeding Information',
        description: 'Update breeding-related information',
        value: {
          purpose: 'Both',
          notes: 'Now suitable for both breeding and production purposes',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated sale listing',
  })
  @ApiResponse({ status: 404, description: 'Sale listing not found' })
  update(
    @Param('id') id: string,
    @Body() updateSaleListingDto: UpdateSaleListingDto,
  ) {
    return this.salesService.update(id, updateSaleListingDto);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update sale listing status',
    description:
      'Update the status of a sale listing (available, reserved, sold)',
  })
  @ApiParam({ name: 'id', description: 'Sale listing ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['available', 'reserved', 'sold'],
          example: 'reserved',
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated sale listing status',
  })
  @ApiResponse({ status: 404, description: 'Sale listing not found' })
  updateStatus(@Param('id') id: string, @Body('status') status: SaleStatus) {
    return this.salesService.updateStatus(id, status);
  }

  @Post(':id/complete')
  @ApiOperation({
    summary: 'Complete a sale',
    description: 'Mark a sale as completed with buyer and payment details',
  })
  @ApiParam({ name: 'id', description: 'Sale listing ID' })
  @ApiBody({
    type: CompleteSaleDto,
    examples: {
      completeCattleSale: {
        summary: 'Complete Cattle Sale',
        description:
          'Complete a dairy or beef cattle sale with full payment details',
        value: {
          saleDate: '2025-06-15T10:00:00Z',
          buyerName: 'John Kamau',
          buyerContact: '+254712345678',
          saleAmount: 85000,
          paymentMethod: 'mobile_money',
          receiptNumber: 'MPESA-RCT-2025-001',
          notes:
            'Buyer satisfied with livestock condition. Healthy animal with good milk production history.',
          attachments: [
            'https://example.com/mpesa-receipt.pdf',
            'https://example.com/health-certificate.pdf',
          ],
        },
      },
      completePoultrySale: {
        summary: 'Complete Poultry Sale',
        description: 'Complete a poultry batch sale with quantity details',
        value: {
          saleDate: '2025-06-20T14:30:00Z',
          buyerName: 'Mary Wanjiku',
          buyerContact: '+254723456789',
          saleAmount: 24000,
          paymentMethod: 'bank_transfer',
          receiptNumber: 'BT-2025-0156',
          notes:
            'Sold 48 out of 50 birds. 2 birds excluded due to minor health concerns. Buyer very satisfied with bird quality.',
          attachments: ['https://example.com/bank-receipt.pdf'],
        },
      },
      completeSwineSale: {
        summary: 'Complete Swine Sale',
        description: 'Complete a swine sale with breeding information',
        value: {
          saleDate: '2025-06-18T11:15:00Z',
          buyerName: 'Peter Mwangi',
          buyerContact: '+254734567890',
          saleAmount: 35000,
          paymentMethod: 'cash',
          receiptNumber: 'CASH-2025-089',
          notes:
            'Excellent breeding gilt sold to experienced pig farmer. Buyer provided proper transport and handling.',
          attachments: [
            'https://example.com/cash-receipt.jpg',
            'https://example.com/transport-photo.jpg',
          ],
        },
      },
      completeGoatSale: {
        summary: 'Complete Goat Sale',
        description: 'Complete a goat herd sale with milk production records',
        value: {
          saleDate: '2025-06-22T09:45:00Z',
          buyerName: 'Grace Nyambura',
          buyerContact: '+254745678901',
          saleAmount: 118000,
          paymentMethod: 'mobile_money',
          receiptNumber: 'MPESA-RCT-2025-078',
          notes:
            'Sold 14 out of 15 dairy goats. One goat retained due to recent kidding. Excellent milk producers with good health records.',
          attachments: [
            'https://example.com/mpesa-receipt-goats.pdf',
            'https://example.com/milk-production-records.pdf',
          ],
        },
      },
      completeSheepSale: {
        summary: 'Complete Sheep Sale',
        description: 'Complete a sheep flock sale with wool production details',
        value: {
          saleDate: '2025-06-25T16:20:00Z',
          buyerName: 'David Kipchoge',
          buyerContact: '+254756789012',
          saleAmount: 235000,
          paymentMethod: 'cheque',
          receiptNumber: 'CHQ-2025-0234',
          notes:
            'Wool sheep flock sold to textile farmer. Excellent wool quality and production history provided. All 30 sheep in perfect health.',
          attachments: [
            'https://example.com/cheque-copy.pdf',
            'https://example.com/wool-quality-report.pdf',
          ],
        },
      },
      completeRabbitSale: {
        summary: 'Complete Rabbit Sale',
        description: 'Complete a rabbit sale for meat production',
        value: {
          saleDate: '2025-06-12T13:10:00Z',
          buyerName: 'Alice Wanjiru',
          buyerContact: '+254767890123',
          saleAmount: 2500,
          paymentMethod: 'mobile_money',
          receiptNumber: 'MPESA-RCT-2025-045',
          notes:
            'Healthy breeding rabbit sold to new rabbit farmer. Provided feeding and care instructions.',
          attachments: ['https://example.com/mpesa-receipt-rabbit.pdf'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully completed sale',
  })
  @ApiResponse({ status: 404, description: 'Sale listing not found' })
  @ApiResponse({ status: 400, description: 'Sale is already completed' })
  completeSale(
    @Param('id') id: string,
    @Body() completeSaleDto: CompleteSaleDto,
  ) {
    return this.salesService.completeSale(id, completeSaleDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete sale listing',
    description: 'Delete a sale listing (only if not sold)',
  })
  @ApiParam({ name: 'id', description: 'Sale listing ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted sale listing',
  })
  @ApiResponse({ status: 404, description: 'Sale listing not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete a completed sale' })
  remove(@Param('id') id: string) {
    return this.salesService.remove(id);
  }

  // Specialized endpoints for mobile app sales screens

  @Post('beef-cattle')
  @ApiOperation({
    summary: 'Record beef cattle sale',
    description: 'Record a direct beef cattle sale transaction',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'farmId',
        'animalId',
        'weight',
        'saleDate',
        'marketPrice',
        'salePrice',
        'buyerName',
        'buyerType',
      ],
      properties: {
        farmId: { type: 'string', example: 'farm_123' },
        livestockId: { type: 'string', example: 'livestock_456' },
        animalId: { type: 'string', example: 'A234' },
        weight: { type: 'number', example: 550 },
        beefQuality: {
          type: 'string',
          enum: ['Low', 'Medium', 'High'],
          example: 'Medium',
        },
        saleDate: { type: 'string', format: 'date', example: '2025-10-05' },
        marketPrice: { type: 'number', example: 80000 },
        salePrice: { type: 'number', example: 85000 },
        buyerName: { type: 'string', example: 'John Doe' },
        buyerType: {
          type: 'string',
          enum: ['Individual', 'Company'],
          example: 'Individual',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Beef cattle sale recorded successfully',
  })
  createBeefSale(@Body() data: any) {
    return this.salesService.createBeefSale(data);
  }

  @Post('milk')
  @ApiOperation({
    summary: 'Record milk production and sale',
    description:
      'Record milk production from dairy cattle or goats with optional sale details',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'farmId',
        'animalId',
        'milkYield',
        'milkQuality',
        'milkingDate',
      ],
      properties: {
        farmId: { type: 'string', example: 'farm_123' },
        livestockId: { type: 'string', example: 'livestock_456' },
        animalId: { type: 'string', example: 'DC001' },
        milkYield: { type: 'number', example: 25 },
        milkQuality: {
          type: 'string',
          enum: ['Low', 'Medium', 'High'],
          example: 'Medium',
        },
        milkingDate: { type: 'string', format: 'date', example: '2025-10-05' },
        homeUseQuantity: { type: 'number', example: 2 },
        saleQuantity: { type: 'number', example: 23 },
        saleDate: { type: 'string', format: 'date', example: '2025-10-05' },
        marketPrice: { type: 'number', example: 50 },
        salePrice: { type: 'number', example: 55 },
        buyerName: { type: 'string', example: 'Jane Doe' },
        buyerType: {
          type: 'string',
          enum: ['Individual', 'Company'],
          example: 'Individual',
        },
        category: { type: 'string', enum: ['dairy', 'goat'], example: 'dairy' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Milk sale recorded successfully' })
  createMilkSale(@Body() data: any) {
    return this.salesService.createMilkSale(data);
  }

  @Post('swine')
  @ApiOperation({
    summary: 'Record swine sale',
    description: 'Record a direct swine sale transaction',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'farmId',
        'animalId',
        'saleWeight',
        'saleDate',
        'marketPrice',
        'salePrice',
        'buyerName',
        'buyerType',
      ],
      properties: {
        farmId: { type: 'string', example: 'farm_123' },
        livestockId: { type: 'string', example: 'livestock_456' },
        animalId: { type: 'string', example: 'S001' },
        saleWeight: { type: 'number', example: 120 },
        saleDate: { type: 'string', format: 'date', example: '2025-10-05' },
        marketPrice: { type: 'number', example: 300 },
        salePrice: { type: 'number', example: 320 },
        buyerName: { type: 'string', example: 'John Doe' },
        buyerType: {
          type: 'string',
          enum: ['Individual', 'Company'],
          example: 'Individual',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Swine sale recorded successfully' })
  createSwineSale(@Body() data: any) {
    return this.salesService.createSwineSale(data);
  }

  @Post('sheep')
  @ApiOperation({
    summary: 'Record sheep sale (wool or meat)',
    description: 'Record sheep wool production or meat sale',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['farmId', 'animalId', 'saleType', 'buyerName', 'buyerType'],
      properties: {
        farmId: { type: 'string', example: 'farm_123' },
        livestockId: { type: 'string', example: 'livestock_456' },
        animalId: { type: 'string', example: 'SH001' },
        saleType: { type: 'string', enum: ['wool', 'meat'], example: 'wool' },
        // Wool specific
        shearingDate: { type: 'string', format: 'date', example: '2025-10-05' },
        woolQuality: {
          type: 'string',
          enum: ['Low', 'Medium', 'High'],
          example: 'Medium',
        },
        woolWeight: { type: 'number', example: 15.5 },
        // Meat specific
        saleWeight: { type: 'number', example: 45 },
        saleDate: { type: 'string', format: 'date', example: '2025-10-05' },
        marketPrice: { type: 'number', example: 600 },
        salePrice: { type: 'number', example: 650 },
        buyerName: { type: 'string', example: 'John Doe' },
        buyerType: {
          type: 'string',
          enum: ['Individual', 'Company'],
          example: 'Individual',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Sheep sale recorded successfully' })
  createSheepSale(@Body() data: any) {
    return this.salesService.createSheepSale(data);
  }

  @Post('rabbit')
  @ApiOperation({
    summary: 'Record rabbit sale',
    description: 'Record a direct rabbit sale transaction',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'farmId',
        'animalId',
        'saleWeight',
        'saleDate',
        'marketPrice',
        'salePrice',
        'buyerName',
        'buyerType',
      ],
      properties: {
        farmId: { type: 'string', example: 'farm_123' },
        livestockId: { type: 'string', example: 'livestock_456' },
        animalId: { type: 'string', example: 'R001' },
        groupId: { type: 'string', example: 'Batch A' },
        saleWeight: { type: 'number', example: 3.5 },
        saleDate: { type: 'string', format: 'date', example: '2025-10-05' },
        marketPrice: { type: 'number', example: 500 },
        salePrice: { type: 'number', example: 550 },
        buyerName: { type: 'string', example: 'John Doe' },
        buyerType: {
          type: 'string',
          enum: ['Individual', 'Company'],
          example: 'Individual',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Rabbit sale recorded successfully',
  })
  createRabbitSale(@Body() data: any) {
    return this.salesService.createRabbitSale(data);
  }

  @Post('poultry')
  @ApiOperation({
    summary: 'Record poultry transaction',
    description: 'Record broiler sale, egg production, or egg sale',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['farmId', 'flockId', 'saleType'],
      properties: {
        farmId: { type: 'string', example: 'farm_123' },
        livestockId: { type: 'string', example: 'livestock_456' },
        flockId: { type: 'string', example: 'FL001' },
        saleType: {
          type: 'string',
          enum: ['broiler', 'egg_production', 'egg_sales'],
          example: 'broiler',
        },
        // Broiler specific
        numberSold: { type: 'number', example: 50 },
        saleWeight: { type: 'number', example: 150 },
        // Egg production specific
        productionDate: {
          type: 'string',
          format: 'date',
          example: '2025-10-05',
        },
        numberOfLayers: { type: 'number', example: 200 },
        eggCount: { type: 'number', example: 180 },
        averageEggWeight: { type: 'number', example: 55 },
        // Egg sales specific
        trays: { type: 'number', example: 10 },
        numberOfEggs: { type: 'number', example: 300 },
        // Common sale fields
        saleDate: { type: 'string', format: 'date', example: '2025-10-05' },
        marketPrice: { type: 'number', example: 400 },
        salePrice: { type: 'number', example: 450 },
        buyerName: { type: 'string', example: 'John Doe' },
        buyerType: {
          type: 'string',
          enum: ['Individual', 'Company'],
          example: 'Individual',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Poultry transaction recorded successfully',
  })
  createPoultryTransaction(@Body() data: any) {
    return this.salesService.createPoultryTransaction(data);
  }

  @Post('egg-production')
  @ApiOperation({
    summary: 'Record egg production',
    description: 'Record daily egg production from layer flocks',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'farmId',
        'flockId',
        'date',
        'numberOfLayers',
        'eggCount',
        'avgEggWeight',
      ],
      properties: {
        farmId: { type: 'string', example: 'farm_123' },
        flockId: { type: 'string', example: 'L001' },
        date: { type: 'string', format: 'date', example: '2025-10-05' },
        numberOfLayers: { type: 'number', example: 200 },
        eggCount: { type: 'number', example: 180 },
        avgEggWeight: { type: 'number', example: 55 },
        gradeA: { type: 'number', example: 150 },
        gradeB: { type: 'number', example: 25 },
        gradeC: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Egg production recorded successfully',
  })
  createEggProduction(@Body() data: any) {
    return this.salesService.createEggProduction(data);
  }
}
