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

  @Get('overview')
  @ApiOperation({
    summary: 'Get Financial Overview',
    description:
      'Get financial overview stats for the dashboard cards including total revenue, expenses, profit, and cash flow',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully generated financial overview',
    schema: {
      type: 'object',
      example: {
        period: 'This month',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        totalRevenue: 14590,
        totalExpenses: 4460,
        netProfit: 10130,
        cashFlow: 3320,
        profitMargin: 69.4,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  async getFinancialOverview(@Query() query: FinancialReportQueryDto) {
    return this.accountingService.getFinancialOverview(query);
  }

  @Get('chart-of-accounts')
  @ApiOperation({
    summary: 'Get Chart of Accounts',
    description:
      'Generate chart of accounts showing all account categories with balances based on farm data',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully generated chart of accounts',
    schema: {
      type: 'object',
      example: {
        period: 'This month',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        assets: {
          current: [
            {
              name: 'Goods in Stock',
              code: '1205',
              balance: 15000,
              type: 'debit',
            },
            {
              name: 'Cash/Bank',
              code: '1200',
              balance: 25000,
              type: 'debit',
            },
          ],
          nonCurrent: [
            {
              name: 'Livestock',
              code: '1300',
              balance: 2850000,
              type: 'debit',
            },
          ],
        },
        revenue: [
          {
            name: 'DairySales',
            code: '4100',
            balance: 15000,
            type: 'credit',
          },
        ],
        expenses: [
          {
            name: 'Feeding',
            code: '5100',
            balance: 8000,
            type: 'debit',
          },
        ],
        liabilities: [
          {
            name: 'PAYE',
            code: '2100',
            balance: 2000,
            type: 'credit',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  async getChartOfAccounts(@Query() query: FinancialReportQueryDto) {
    return this.accountingService.getChartOfAccounts(query);
  }

  @Get('journals/sales')
  @ApiOperation({
    summary: 'Get Sales Journal',
    description:
      'Generate sales journal entries from livestock sales and sale listings',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully generated sales journal',
    schema: {
      type: 'object',
      example: {
        period: 'This month',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        entries: [
          {
            id: 1,
            date: '2025-01-15',
            reference: 'RCP-001',
            description: 'Sale of 25L of Milk',
            account: 'DairySales',
            debit: null,
            credit: 1250,
          },
          {
            id: 2,
            date: '2025-01-15',
            reference: 'RCP-001',
            description: 'Sale of 25L of Milk',
            account: 'Cash/Bank',
            debit: 1250,
            credit: null,
          },
        ],
        totals: {
          totalDebits: 14590,
          totalCredits: 14590,
          entryCount: 15,
        },
      },
    },
  })
  async getSalesJournal(@Query() query: FinancialReportQueryDto) {
    return this.accountingService.getSalesJournal(query);
  }

  @Get('journals/purchases')
  @ApiOperation({
    summary: 'Get Purchases Journal',
    description:
      'Generate purchases journal entries from feed purchases, health expenses, and other purchases',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully generated purchases journal',
  })
  async getPurchasesJournal(@Query() query: FinancialReportQueryDto) {
    return this.accountingService.getPurchasesJournal(query);
  }

  @Get('journals/assets')
  @ApiOperation({
    summary: 'Get Assets Journal',
    description:
      'Generate assets journal entries from machinery, utilities, water, and power installations',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully generated assets journal',
  })
  async getAssetsJournal(@Query() query: FinancialReportQueryDto) {
    return this.accountingService.getAssetsJournal(query);
  }

  @Get('journals/payroll')
  @ApiOperation({
    summary: 'Get Payroll Journal',
    description:
      'Generate payroll journal entries from employee salaries and benefits',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully generated payroll journal',
  })
  async getPayrollJournal(@Query() query: FinancialReportQueryDto) {
    return this.accountingService.getPayrollJournal(query);
  }

  @Get('journals/general')
  @ApiOperation({
    summary: 'Get General Journal',
    description:
      'Generate general journal entries including biological gains and other miscellaneous entries',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully generated general journal',
  })
  async getGeneralJournal(@Query() query: FinancialReportQueryDto) {
    return this.accountingService.getGeneralJournal(query);
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
  })
  async getGeneralLedger(@Query() query: FinancialReportQueryDto) {
    return this.accountingService.getGeneralLedger(query);
  }

  @Get('reports/trial-balance')
  @ApiOperation({
    summary: 'Get Trial Balance Report',
    description:
      'Generate trial balance report showing all account balances with debits and credits for verification',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully generated trial balance report',
  })
  async getTrialBalance(@Query() query: FinancialReportQueryDto) {
    return this.accountingService.getTrialBalance(query);
  }

  @Get('reports/balance-sheet')
  @ApiOperation({
    summary: 'Get Balance Sheet Report',
    description:
      'Generate balance sheet report showing financial position with assets, liabilities, and equity',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully generated balance sheet report',
  })
  async getBalanceSheetReport(@Query() query: FinancialReportQueryDto) {
    return this.accountingService.getBalanceSheet(query);
  }

  @Get('reports/profit-loss')
  @ApiOperation({
    summary: 'Get Profit & Loss Report',
    description:
      'Generate profit and loss statement showing revenue, expenses, and profitability',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully generated profit & loss report',
  })
  async getProfitAndLossReport(@Query() query: FinancialReportQueryDto) {
    return this.accountingService.getProfitAndLoss(query);
  }

  @Get('reports/cash-flow')
  @ApiOperation({
    summary: 'Get Cash Flow Report',
    description:
      'Generate cash flow statement showing operating, investing, and financing activities',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully generated cash flow report',
  })
  async getCashFlowReport(@Query() query: FinancialReportQueryDto) {
    return this.accountingService.getCashFlow(query);
  }
}
