import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import {
  AnalyticsQueryDto,
  LivestockAnalyticsQueryDto,
  EmployeeAnalyticsQueryDto,
} from './dto/analytics-query.dto';
import {
  ProductionAnalyticsQueryDto,
  FinancialTrendsQueryDto,
  KPIQueryDto,
} from './dto/specialized-analytics.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('business-overview')
  @ApiOperation({
    summary: 'Get Business Analytics Overview',
    description:
      'Get comprehensive business analytics including revenue, expenses, and profitability metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved business analytics overview',
    schema: {
      type: 'object',
      example: {
        period: 'This month',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        revenue: {
          dairySales: 1090,
          beefSales: 3500,
          livestockSales: 14590,
          total: 14590,
        },
        expenses: {
          feedCosts: 840,
          healthCosts: 1075,
          breedingCosts: 255,
          total: 4460,
        },
        profitability: {
          grossProfit: 10130,
          netProfit: 10130,
          profitMargin: 69.4,
        },
        cashFlow: {
          operating: 125,
          investing: -2240815,
          financing: 0,
        },
      },
    },
  })
  async getBusinessOverview(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getBusinessOverview(query);
  }

  @Get('livestock')
  @ApiOperation({
    summary: 'Get Livestock Analytics',
    description:
      'Get detailed livestock analytics including population, health status, and asset values',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved livestock analytics',
    schema: {
      type: 'object',
      example: {
        period: 'This month',
        totalAnimals: 847,
        totalValue: 2400000,
        categories: {
          mammal_cattle: 85,
          mammal_goats: 120,
          mammal_sheep: 95,
          poultry_layers: 350,
          poultry_broilers: 152,
        },
        managementTypes: {
          individual: 345,
          flocks: 502,
        },
        healthStatus: {
          healthy: 785,
          underTreatment: 42,
          quarantined: 20,
        },
        productionMetrics: {
          milkProduction: 280,
          eggProduction: 185,
          meatProduction: 45,
        },
      },
    },
  })
  async getLivestockAnalytics(@Query() query: LivestockAnalyticsQueryDto) {
    return this.analyticsService.getLivestockAnalytics(query);
  }

  @Get('employees')
  @ApiOperation({
    summary: 'Get Employee Analytics',
    description:
      'Get employee analytics including payroll, positions, and employment types',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved employee analytics',
    schema: {
      type: 'object',
      example: {
        period: 'This month',
        totalEmployees: 12,
        totalPayroll: 263000,
        totalDeductions: 39450,
        netPay: 223550,
        employmentTypes: {
          permanent: 8,
          casual: 4,
        },
        positions: {
          'Farm Manager': { count: 1, totalWages: 35000 },
          'Livestock Supervisor': { count: 2, totalWages: 45000 },
          'Dairy Technician': { count: 3, totalWages: 60000 },
          'General Worker': { count: 4, totalWages: 80000 },
        },
        deductions: {
          nssf: 2630,
          sha: 6575,
          nita: 600,
          paye: 26300,
        },
      },
    },
  })
  async getEmployeeAnalytics(@Query() query: EmployeeAnalyticsQueryDto) {
    return this.analyticsService.getEmployeeAnalytics(query);
  }

  @Get('breeding')
  @ApiOperation({
    summary: 'Get Breeding Analytics',
    description:
      'Get breeding analytics including AI services, birth records, and success rates',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved breeding analytics',
    schema: {
      type: 'object',
      example: {
        period: 'This month',
        aiOverview: {
          totalAICost: 81000,
          avgAICost: 1190,
          purposeBreakdown: {
            Immunity: 41,
            Production: 32,
            'Stocking Number': 27,
          },
          servicingTypes: {
            'Local AI': 41,
            Natural: 32,
            'Imported AI': 27,
          },
          successRate: 48.7,
        },
        birthAnalytics: {
          numberOfCalves: 100,
          avgBirthWeight: 34.67,
          deliveryMethods: {
            'Natural birth': 34,
            Assisted: 33,
            Cesarean: 33,
          },
        },
        servicingDetails: {
          totalServicing: 68,
          successfulServicing: 33,
          pendingResults: 18,
          failedServicing: 17,
        },
        costAnalysis: {
          totalCost: 139000,
          averageCostPerAnimal: 2044,
        },
      },
    },
  })
  async getBreedingAnalytics(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getBreedingAnalytics(query);
  }

  @Get('health')
  @ApiOperation({
    summary: 'Get Health Analytics',
    description:
      'Get health analytics including treatment costs, vaccination records, and disease incidences',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved health analytics',
    schema: {
      type: 'object',
      example: {
        period: 'This month',
        treatment: {
          treatmentCost: 198000,
          totalDrugCost: 61000,
          totalServiceCost: 137000,
          incidenceRates: {
            Anthrax: 12,
            Metritis: 12,
            'Worm Infestation': 12,
            Brucellosis: 11,
          },
          treatmentTypes: {
            Curative: 84,
            Preventive: 40,
            Behavioral: 43,
            Supportive: 31,
          },
        },
        vaccination: {
          totalExpense: 334000,
          totalVaccinesCost: 267000,
          totalServiceCost: 67000,
          incidences: {
            Mastitis: 16,
            'East Coast Fever': 14,
            'Lumpy Skin Disease': 13,
          },
        },
        deworming: {
          dewormingCost: 25000,
          totalDrugCost: 20000,
          totalServiceCost: 4964,
          prevalence: {
            Lungworms: 25,
            'Stomach Worms': 23,
            'Liver Fluke': 21,
          },
        },
        boosters: {
          totalExpense: 156000,
          purposes: {
            'Improve fertility': 50,
            'Boost protein intake': 48,
            'Prevent dehydration': 47,
          },
        },
        genetic: {
          totalExpense: 85000,
          disorders: {
            'Congenital Hypothricosis': 7,
            'Syndactyly (Mule Foot)': 5,
            'Bovine Citrullinemia': 6,
          },
        },
      },
    },
  })
  async getHealthAnalytics(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getHealthAnalytics(query);
  }

  @Get('feeding')
  @ApiOperation({
    summary: 'Get Feeding Analytics',
    description:
      'Get feeding analytics including consumption patterns, costs, and supplier performance',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved feeding analytics',
    schema: {
      type: 'object',
      example: {
        period: 'This month',
        totalFeedConsumed: 1270,
        totalFeedExpense: 94000,
        feedSources: {
          'Personally Grown': 399.93,
          'Purely Purchased': 411.01,
          'Grown and Purchased': 462.96,
        },
        feedSchedule: {
          Morning: 391.95,
          'All Day': 337.58,
          Evening: 280.91,
          'During Milking': 263.46,
        },
        feedTypes: {
          Basal: 18000,
          Concentrates: 46000,
          Supplements: 30000,
        },
        supplierPerformance: {
          'Bluebird Dairy': { totalCost: 3500, totalQuantity: 100 },
          'Mwea Feed Mill': { totalCost: 3400, totalQuantity: 95 },
        },
      },
    },
  })
  async getFeedingAnalytics(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getFeedingAnalytics(query);
  }

  @Get('inventory')
  @ApiOperation({
    summary: 'Get Inventory Analytics',
    description:
      'Get inventory analytics including asset values, facilities, equipment, and goods in stock',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved inventory analytics',
    schema: {
      type: 'object',
      example: {
        period: 'This month',
        totalInventoryValue: 2250815,
        categories: {
          goodsInStock: 87315,
          machinery: 178500,
          utilities: 1985000,
        },
        facilities: [
          {
            id: 'facility1',
            structureType: 'Milking Parlor',
            constructionCost: 4650000,
            maintenanceCost: 96800,
          },
        ],
        equipment: [
          {
            id: 'equipment1',
            equipmentName: 'Cattle Water Trough',
            condition: 'working',
          },
        ],
        goodsInStock: [
          {
            id: 'goods1',
            itemName: 'Calf Starter',
            quantity: 100,
            condition: 'good',
          },
        ],
      },
    },
  })
  async getInventoryAnalytics(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getInventoryAnalytics(query);
  }

  @Get('sales')
  @ApiOperation({
    summary: 'Get Sales Analytics',
    description:
      'Get sales analytics including revenue breakdown, buyer performance, and sales trends',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved sales analytics',
    schema: {
      type: 'object',
      example: {
        period: 'This month',
        totalRevenue: 28060000,
        salesByCategory: {
          mammal_cattle: { count: 15, revenue: 675000 },
          mammal_goats: { count: 25, revenue: 200000 },
          poultry_broilers: { count: 500, revenue: 400000 },
        },
        buyerPerformance: {
          'Happy Cow Ltd': { purchases: 5, totalSpent: 225000 },
          'Rift Valley Meats': { purchases: 3, totalSpent: 450000 },
        },
        livestockSales: 43,
        averageSalePrice: 652325,
      },
    },
  })
  async getSalesAnalytics(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getSalesAnalytics(query);
  }

  @Get('kpis')
  @ApiOperation({
    summary: 'Get KPI Metrics with Comparisons',
    description:
      'Get key performance indicators with period-over-period comparisons',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved KPI metrics',
    schema: {
      type: 'object',
      example: {
        totalRevenue: {
          current: 14590,
          previous: 12500,
          change: 16.72,
          changeType: 'positive',
        },
        totalExpenses: {
          current: 4460,
          previous: 5200,
          change: -14.23,
          changeType: 'positive',
        },
        netProfit: {
          current: 10130,
          previous: 7300,
          change: 38.77,
          changeType: 'positive',
        },
        profitMargin: {
          current: 69.4,
          previous: 58.4,
          change: 18.84,
          changeType: 'positive',
        },
      },
    },
  })
  async getKPIMetrics(@Query() query: KPIQueryDto) {
    return this.analyticsService.getKPIMetrics(query);
  }

  @Get('trends')
  @ApiOperation({
    summary: 'Get Financial Trends',
    description: 'Get financial trends over time with configurable granularity',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved financial trends',
    schema: {
      type: 'object',
      example: {
        granularity: 'monthly',
        periods: 12,
        metrics: ['revenue', 'expenses', 'profit'],
        data: [
          {
            period: 'Jan 2024',
            revenue: 12000,
            expenses: 4500,
            profit: 7500,
          },
          {
            period: 'Feb 2024',
            revenue: 13500,
            expenses: 4200,
            profit: 9300,
          },
        ],
      },
    },
  })
  async getFinancialTrends(@Query() query: FinancialTrendsQueryDto) {
    return this.analyticsService.getFinancialTrends(query);
  }

  @Get('production')
  @ApiOperation({
    summary: 'Get Production Analytics',
    description: 'Get production analytics for milk, eggs, and meat production',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved production analytics',
    schema: {
      type: 'object',
      example: {
        period: 'This month',
        milkProduction: {
          dailyAverage: 280,
          totalPeriod: 8680,
          producingAnimals: 85,
        },
        eggProduction: {
          dailyAverage: 185,
          totalPeriod: 5735,
          producingAnimals: 350,
        },
        meatProduction: {
          weeklyAverage: 45,
          totalPeriod: 180,
          producingAnimals: 152,
        },
      },
    },
  })
  async getProductionAnalytics(@Query() query: ProductionAnalyticsQueryDto) {
    return this.analyticsService.getProductionAnalytics(query);
  }

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get Dashboard Summary',
    description: 'Get comprehensive dashboard summary with all key metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved dashboard summary',
    schema: {
      type: 'object',
      example: {
        period: 'This month',
        kpis: {
          totalRevenue: {
            current: 14590,
            previous: 12500,
            change: 16.72,
            changeType: 'positive',
          },
        },
        businessOverview: {
          revenue: { total: 14590 },
          expenses: { total: 4460 },
          profitability: { netProfit: 10130 },
        },
        livestock: {
          totalAnimals: 847,
          totalValue: 2400000,
          healthStatus: {
            healthy: 785,
            underTreatment: 42,
            quarantined: 20,
          },
        },
        employees: {
          totalEmployees: 12,
          totalPayroll: 263000,
          netPay: 223550,
        },
        health: {
          totalHealthCost: 798000,
        },
      },
    },
  })
  async getDashboardSummary(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getDashboardSummary(query);
  }
}
