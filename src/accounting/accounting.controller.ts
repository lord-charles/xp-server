import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { FinancialReportQueryDto } from './dto/financial-report-query.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('accounting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get('profit-loss')
  @ApiOperation({
    summary: 'Get Profit & Loss Statement',
    description:
      'Generate profit and loss statement based on farm operations data including sales, expenses, and costs',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully generated profit & loss statement',
    schema: {
      type: 'object',
      example: {
        period: 'This month',
        startDate: '2025-05-01',
        endDate: '2025-05-31',
        revenue: {
          dairySales: 1090,
          beefSales: 3500,
          biologicalGains: 10000,
          total: 14590,
        },
        costOfGoodsSold: {
          feeds: 840,
          healthVaccination: 215,
          healthDeworming: 215,
          healthTreatment: 215,
          healthBoosters: 380,
          salariesAndWages: 2240,
          breedingServices: 255,
          total: 4460,
        },
        grossProfit: 10130,
        operatingExpenses: {
          total: 0,
        },
        netProfit: 10130,
        margins: {
          grossMargin: 69.4,
          netMargin: 69.4,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  async getProfitAndLoss(@Query() query: FinancialReportQueryDto) {
    return this.accountingService.getProfitAndLoss(query);
  }

  @Get('cash-flow')
  @ApiOperation({
    summary: 'Get Cash Flow Statement',
    description:
      'Generate cash flow statement showing operating, investing, and financing activities',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully generated cash flow statement',
    schema: {
      type: 'object',
      example: {
        period: 'This month',
        startDate: '2025-05-01',
        endDate: '2025-05-31',
        operatingActivities: {
          inflows: {
            dairySales: 4590,
            total: 4590,
          },
          outflows: {
            feedPurchases: 840,
            vaccinationExpenses: 215,
            treatmentExpenses: 215,
            total: 1270,
          },
          netOperatingCash: 3320,
        },
        investingActivities: {
          outflows: [
            {
              description: 'water infrastructure',
              amount: 2070000,
            },
          ],
          netInvestingCash: -2070000,
        },
        financingActivities: {
          netFinancingCash: 0,
        },
        netCashMovement: -2066680,
        cashFlowHealth: {
          operatingCashRatio: 72.3,
          isPositiveOperatingCash: true,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  async getCashFlow(@Query() query: FinancialReportQueryDto) {
    return this.accountingService.getCashFlow(query);
  }

  @Get('trial-balance')
  @ApiOperation({
    summary: 'Get Trial Balance',
    description:
      'Generate trial balance showing all account balances with debits and credits',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully generated trial balance',
    schema: {
      type: 'object',
      example: {
        period: 'This month',
        startDate: '2025-05-01',
        endDate: '2025-05-31',
        accounts: [
          {
            account: 'Bank/Cash',
            debit: 10130,
            credit: 0,
            balance: 10130,
          },
          {
            account: 'Dairy Sales',
            debit: 0,
            credit: 1090,
            balance: -1090,
          },
          {
            account: 'Feeds',
            debit: 840,
            credit: 0,
            balance: 840,
          },
        ],
        totals: {
          totalDebits: 14590,
          totalCredits: 14590,
          isBalanced: true,
          variance: 0,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  async getTrialBalance(@Query() query: FinancialReportQueryDto) {
    return this.accountingService.getTrialBalance(query);
  }

  @Get('general-ledger')
  @ApiOperation({
    summary: 'Get General Ledger',
    description:
      'Generate general ledger showing account summaries with account types',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully generated general ledger',
    schema: {
      type: 'object',
      example: {
        period: 'This month',
        startDate: '2025-05-01',
        endDate: '2025-05-31',
        accounts: [
          {
            account: 'Bank/Cash',
            debit: 10130,
            credit: 0,
            balance: 10130,
            accountType: 'Assets',
          },
          {
            account: 'Dairy Sales',
            debit: 0,
            credit: 1090,
            balance: -1090,
            accountType: 'Revenue',
          },
        ],
        totals: {
          totalDebits: 14590,
          totalCredits: 14590,
          isBalanced: true,
          variance: 0,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  async getGeneralLedger(@Query() query: FinancialReportQueryDto) {
    return this.accountingService.getGeneralLedger(query);
  }

  @Get('balance-sheet')
  @ApiOperation({
    summary: 'Get Balance Sheet',
    description:
      'Generate balance sheet showing assets, liabilities, and equity',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully generated balance sheet',
    schema: {
      type: 'object',
      example: {
        period: 'This month',
        assets: {
          currentAssets: {
            cashAndBank: 10130,
            total: 10130,
          },
          nonCurrentAssets: {
            livestock: 2850000,
            infrastructure: 2214500,
            total: 5064500,
          },
          totalAssets: 5074630,
        },
        liabilities: {
          currentLiabilities: { total: 0 },
          nonCurrentLiabilities: { total: 0 },
          totalLiabilities: 0,
        },
        equity: {
          ownersEquity: 5074630,
          totalEquity: 5074630,
        },
        isBalanced: true,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  async getBalanceSheet(@Query() query: FinancialReportQueryDto) {
    return this.accountingService.getBalanceSheet(query);
  }
}
