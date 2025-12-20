import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  FinancialReportQueryDto,
  ReportPeriod,
} from './dto/financial-report-query.dto';

@Injectable()
export class AccountingService {
  constructor(private prisma: PrismaService) {}

  private getDateRange(
    period: ReportPeriod,
    startDate?: string,
    endDate?: string,
  ) {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (period) {
      case ReportPeriod.THIS_WEEK:
        start = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - now.getDay(),
        );
        break;
      case ReportPeriod.THIS_MONTH:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case ReportPeriod.THIS_QUARTER:
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case ReportPeriod.THIS_YEAR:
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case ReportPeriod.LAST_MONTH:
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case ReportPeriod.DATE_RANGE:
        if (!startDate || !endDate) {
          throw new Error(
            'Start date and end date are required for date range period',
          );
        }
        start = new Date(startDate);
        end = new Date(endDate);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { start, end };
  }

  async getProfitAndLoss(query: FinancialReportQueryDto) {
    const {
      farmId,
      period = ReportPeriod.THIS_MONTH,
      startDate,
      endDate,
    } = query;
    const { start, end } = this.getDateRange(period, startDate, endDate);

    // Verify farm exists
    const farm = await this.prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm) {
      throw new NotFoundException(`Farm with ID ${farmId} not found`);
    }

    // REVENUE CALCULATION
    const [livestockSales, saleListings] = await Promise.all([
      // Direct livestock sales
      this.prisma.sale.findMany({
        where: {
          livestock: { farmId },
          saleDate: { gte: start, lte: end },
        },
        select: { saleAmount: true },
      }),
      // Marketplace sales (completed)
      this.prisma.saleListing.findMany({
        where: {
          farmId,
          status: 'sold',
          saleDate: { gte: start, lte: end },
        },
        select: { saleAmount: true, price: true },
      }),
    ]);

    const dairySales = livestockSales
      .filter((sale) => sale.saleAmount > 0)
      .reduce((sum, sale) => sum + sale.saleAmount, 0);

    const beefSales = saleListings.reduce(
      (sum, listing) => sum + (listing.saleAmount || listing.price),
      0,
    );

    // For biological gains, we can estimate based on breeding records with births
    const biologicalGains = await this.prisma.breedingRecord.findMany({
      where: {
        farmId,
        birthRecorded: true,
        birthDate: { gte: start, lte: end },
      },
      select: { youngOnes: true },
    });

    const biologicalGainValue = biologicalGains.reduce((sum, record) => {
      // Estimate value per newborn (this could be configurable)
      const estimatedValuePerCalf = 10000; // KES
      return sum + (record.youngOnes || 0) * estimatedValuePerCalf;
    }, 0);

    const totalRevenue = dairySales + beefSales + biologicalGainValue;

    // EXPENSES CALCULATION
    const [feedExpenses, healthExpenses, salaryExpenses, breedingExpenses] =
      await Promise.all([
        // Feed expenses
        this.prisma.feedDetails.findMany({
          where: {
            feedingProgram: { farmId },
            date: { gte: start, lte: end },
          },
          select: { cost: true },
        }),
        // Health expenses
        Promise.all([
          this.prisma.vaccinationRecord.findMany({
            where: {
              farmId,
              dateAdministered: { gte: start, lte: end },
            },
            select: { costOfVaccine: true, costOfService: true },
          }),
          this.prisma.dewormingRecord.findMany({
            where: {
              farmId,
              dateAdministered: { gte: start, lte: end },
            },
            select: { costOfVaccine: true, costOfService: true },
          }),
          this.prisma.treatmentRecord.findMany({
            where: {
              farmId,
              dateAdministered: { gte: start, lte: end },
            },
            select: { costOfDrugs: true, costOfService: true },
          }),
          this.prisma.boosterRecord.findMany({
            where: {
              farmId,
              dateAdministered: { gte: start, lte: end },
            },
            select: { costOfBooster: true },
          }),
        ]),
        // Salary expenses (monthly allocation)
        this.prisma.employee.findMany({
          where: {
            farms: { some: { farmId } },
            dateOfEmployment: { lte: end },
            OR: [{ endDate: null }, { endDate: { gte: start } }],
          },
          select: { salary: true, paymentSchedule: true },
        }),
        // Breeding/AI expenses
        this.prisma.breedingRecord.findMany({
          where: {
            farmId,
            serviceDate: { gte: start, lte: end },
          },
          select: { aiCost: true },
        }),
      ]);

    const feedCosts = feedExpenses.reduce(
      (sum, feed) => sum + (feed.cost || 0),
      0,
    );

    const [vaccinations, dewormings, treatments, boosters] = healthExpenses;
    const vaccinationCosts = vaccinations.reduce(
      (sum, v) => sum + (v.costOfVaccine || 0) + (v.costOfService || 0),
      0,
    );
    const dewormingCosts = dewormings.reduce(
      (sum, d) => sum + (d.costOfVaccine || 0) + (d.costOfService || 0),
      0,
    );
    const treatmentCosts = treatments.reduce(
      (sum, t) => sum + (t.costOfDrugs || 0) + (t.costOfService || 0),
      0,
    );
    const boosterCosts = boosters.reduce(
      (sum, b) => sum + (b.costOfBooster || 0),
      0,
    );

    const totalHealthCosts =
      vaccinationCosts + dewormingCosts + treatmentCosts + boosterCosts;

    // Calculate salary costs for the period
    const monthsInPeriod = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30),
    );
    const salaryCosts = salaryExpenses.reduce((sum, emp) => {
      const monthlySalary =
        emp.paymentSchedule === 'Monthly' ? emp.salary : emp.salary / 12;
      return sum + monthlySalary * monthsInPeriod;
    }, 0);

    const breedingCosts = breedingExpenses.reduce(
      (sum, breeding) => sum + (breeding.aiCost || 0),
      0,
    );

    const totalCOGS =
      feedCosts + totalHealthCosts + salaryCosts + breedingCosts;
    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = grossProfit; // No operating expenses calculated yet

    return {
      period: period,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      revenue: {
        dairySales,
        beefSales,
        biologicalGains: biologicalGainValue,
        total: totalRevenue,
      },
      costOfGoodsSold: {
        feeds: feedCosts,
        healthVaccination: vaccinationCosts,
        healthDeworming: dewormingCosts,
        healthTreatment: treatmentCosts,
        healthBoosters: boosterCosts,
        salariesAndWages: salaryCosts,
        breedingServices: breedingCosts,
        total: totalCOGS,
      },
      grossProfit,
      operatingExpenses: {
        total: 0, // No operating expenses in current schema
      },
      netProfit,
      margins: {
        grossMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
        netMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
      },
    };
  }

  async getCashFlow(query: FinancialReportQueryDto) {
    const {
      farmId,
      period = ReportPeriod.THIS_MONTH,
      startDate,
      endDate,
    } = query;
    const { start, end } = this.getDateRange(period, startDate, endDate);

    // Operating Activities - Cash Inflows
    const [salesInflows, operatingOutflows] = await Promise.all([
      // Cash from sales
      this.prisma.sale.findMany({
        where: {
          livestock: { farmId },
          saleDate: { gte: start, lte: end },
        },
        select: { saleAmount: true },
      }),
      // Operating cash outflows
      Promise.all([
        this.prisma.feedDetails.findMany({
          where: {
            feedingProgram: { farmId },
            date: { gte: start, lte: end },
          },
          select: { cost: true },
        }),
        this.prisma.vaccinationRecord.findMany({
          where: {
            farmId,
            dateAdministered: { gte: start, lte: end },
          },
          select: { costOfVaccine: true, costOfService: true },
        }),
        this.prisma.treatmentRecord.findMany({
          where: {
            farmId,
            dateAdministered: { gte: start, lte: end },
          },
          select: { costOfDrugs: true, costOfService: true },
        }),
      ]),
    ]);

    const operatingInflows = salesInflows.reduce(
      (sum, sale) => sum + sale.saleAmount,
      0,
    );

    const [feeds, vaccinations, treatments] = operatingOutflows;
    const feedOutflows = feeds.reduce((sum, f) => sum + (f.cost || 0), 0);
    const vaccinationOutflows = vaccinations.reduce(
      (sum, v) => sum + (v.costOfVaccine || 0) + (v.costOfService || 0),
      0,
    );
    const treatmentOutflows = treatments.reduce(
      (sum, t) => sum + (t.costOfDrugs || 0) + (t.costOfService || 0),
      0,
    );

    const totalOperatingOutflows =
      feedOutflows + vaccinationOutflows + treatmentOutflows;
    const netOperatingCash = operatingInflows - totalOperatingOutflows;

    // Investing Activities - Asset purchases
    // Get infrastructure/equipment values from utilities, water, and power
    const utilities = await this.prisma.utility.findMany({
      where: { inventory: { farmId } },
      select: {
        constructionCost: true,
        maintenanceCost: true,
      },
    });

    const water = await this.prisma.water.findMany({
      where: { inventory: { farmId } },
      select: {
        waterConstructionCost: true,
      },
    });

    const power = await this.prisma.power.findMany({
      where: { inventory: { farmId } },
      select: {
        powerInstallationCost: true,
      },
    });

    const netInvestingCash = -[
      ...utilities.map((u) => u.constructionCost || 0),
      ...water.map((w) => w.waterConstructionCost || 0),
      ...power.map((p) => p.powerInstallationCost || 0),
    ].reduce((sum, cost) => sum + cost, 0);

    const netCashMovement = netOperatingCash + netInvestingCash;

    return {
      period,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      operatingActivities: {
        inflows: {
          dairySales: operatingInflows,
          total: operatingInflows,
        },
        outflows: {
          feedPurchases: feedOutflows,
          vaccinationExpenses: vaccinationOutflows,
          treatmentExpenses: treatmentOutflows,
          total: totalOperatingOutflows,
        },
        netOperatingCash,
      },
      investingActivities: {
        outflows: [
          ...utilities.map((u) => ({
            description: 'Facility infrastructure',
            amount: u.constructionCost || 0,
          })),
          ...water.map((w) => ({
            description: 'Water system infrastructure',
            amount: w.waterConstructionCost || 0,
          })),
          ...power.map((p) => ({
            description: 'Power system infrastructure',
            amount: p.powerInstallationCost || 0,
          })),
        ],
        netInvestingCash,
      },
      financingActivities: {
        netFinancingCash: 0, // No financing data in current schema
      },
      netCashMovement,
      cashFlowHealth: {
        operatingCashRatio:
          operatingInflows > 0
            ? (netOperatingCash / operatingInflows) * 100
            : 0,
        isPositiveOperatingCash: netOperatingCash > 0,
      },
    };
  }

  async getTrialBalance(query: FinancialReportQueryDto) {
    const {
      farmId,
      period = ReportPeriod.THIS_MONTH,
      startDate,
      endDate,
    } = query;
    const { start, end } = this.getDateRange(period, startDate, endDate);

    // Since we don't have a formal chart of accounts, we'll create virtual accounts
    // based on the data we have
    const accounts = [];

    // Cash/Bank Account (calculated from sales minus expenses)
    const profitLoss = await this.getProfitAndLoss(query);
    const cashBalance = profitLoss.netProfit; // Simplified assumption

    accounts.push({
      account: 'Bank/Cash',
      debit: Math.max(0, cashBalance),
      credit: Math.max(0, -cashBalance),
      balance: cashBalance,
    });

    // Revenue Accounts (Credits)
    accounts.push({
      account: 'Dairy Sales',
      debit: 0,
      credit: profitLoss.revenue.dairySales,
      balance: -profitLoss.revenue.dairySales,
    });

    accounts.push({
      account: 'Beef Sales',
      debit: 0,
      credit: profitLoss.revenue.beefSales,
      balance: -profitLoss.revenue.beefSales,
    });

    if (profitLoss.revenue.biologicalGains > 0) {
      accounts.push({
        account: 'Biological Gains',
        debit: 0,
        credit: profitLoss.revenue.biologicalGains,
        balance: -profitLoss.revenue.biologicalGains,
      });
    }

    // Expense Accounts (Debits)
    if (profitLoss.costOfGoodsSold.feeds > 0) {
      accounts.push({
        account: 'Feeds',
        debit: profitLoss.costOfGoodsSold.feeds,
        credit: 0,
        balance: profitLoss.costOfGoodsSold.feeds,
      });
    }

    if (profitLoss.costOfGoodsSold.healthVaccination > 0) {
      accounts.push({
        account: 'Health - Vaccination',
        debit: profitLoss.costOfGoodsSold.healthVaccination,
        credit: 0,
        balance: profitLoss.costOfGoodsSold.healthVaccination,
      });
    }

    if (profitLoss.costOfGoodsSold.salariesAndWages > 0) {
      accounts.push({
        account: 'Salaries and Wages',
        debit: profitLoss.costOfGoodsSold.salariesAndWages,
        credit: 0,
        balance: profitLoss.costOfGoodsSold.salariesAndWages,
      });
    }

    const totalDebits = accounts.reduce((sum, acc) => sum + acc.debit, 0);
    const totalCredits = accounts.reduce((sum, acc) => sum + acc.credit, 0);

    return {
      period,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      accounts,
      totals: {
        totalDebits,
        totalCredits,
        isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
        variance: totalDebits - totalCredits,
      },
    };
  }

  async getGeneralLedger(query: FinancialReportQueryDto) {
    const trialBalance = await this.getTrialBalance(query);

    // Convert trial balance to ledger format with account types
    const ledgerAccounts = trialBalance.accounts.map((account) => ({
      ...account,
      accountType: this.getAccountType(account.account),
    }));

    return {
      ...trialBalance,
      accounts: ledgerAccounts,
    };
  }

  private getAccountType(accountName: string): string {
    if (
      accountName.includes('Sales') ||
      accountName.includes('Income') ||
      accountName.includes('Gains')
    ) {
      return 'Revenue';
    }
    if (accountName.includes('Cash') || accountName.includes('Bank')) {
      return 'Assets';
    }
    return 'Expenses';
  }

  async getBalanceSheet(query: FinancialReportQueryDto) {
    const { farmId } = query;

    // Get current livestock valuation
    const livestock = await this.prisma.saleListing.findMany({
      where: { farmId, status: { in: ['available', 'reserved'] } },
      select: { price: true, quantity: true },
    });

    const livestockValue = livestock.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0,
    );

    // Get infrastructure/equipment values
    const utilities = await this.prisma.utility.findMany({
      where: { inventory: { farmId } },
      select: {
        constructionCost: true,
      },
    });

    const water = await this.prisma.water.findMany({
      where: { inventory: { farmId } },
      select: {
        waterConstructionCost: true,
      },
    });

    const power = await this.prisma.power.findMany({
      where: { inventory: { farmId } },
      select: {
        powerInstallationCost: true,
      },
    });

    const infrastructureValue = [
      ...utilities.map((u) => u.constructionCost || 0),
      ...water.map((w) => w.waterConstructionCost || 0),
      ...power.map((p) => p.powerInstallationCost || 0),
    ].reduce((sum, cost) => sum + cost, 0);

    // Get current cash position (simplified)
    const profitLoss = await this.getProfitAndLoss(query);
    const cashPosition = profitLoss.netProfit; // Simplified

    // Assets
    const currentAssets = Math.max(0, cashPosition);
    const nonCurrentAssets = livestockValue + infrastructureValue;
    const totalAssets = currentAssets + nonCurrentAssets;

    // For now, we'll assume no liabilities in the current schema
    const totalLiabilities = 0;
    const totalEquity = totalAssets; // Assets = Equity (no liabilities)

    return {
      period: query.period,
      assets: {
        currentAssets: {
          cashAndBank: cashPosition,
          total: currentAssets,
        },
        nonCurrentAssets: {
          livestock: livestockValue,
          infrastructure: infrastructureValue,
          total: nonCurrentAssets,
        },
        totalAssets,
      },
      liabilities: {
        currentLiabilities: { total: 0 },
        nonCurrentLiabilities: { total: 0 },
        totalLiabilities,
      },
      equity: {
        ownersEquity: totalEquity,
        totalEquity,
      },
      isBalanced:
        Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
    };
  }
}
