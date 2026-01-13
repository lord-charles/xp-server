import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  FinancialReportQueryDto,
  ReportPeriod,
} from './dto/financial-report-query.dto';

@Injectable()
export class AccountingService {
  constructor(private prisma: PrismaService) {}

  async getFinancialOverview(query: FinancialReportQueryDto) {
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

    // Get revenue data
    const [livestockSales, saleListings] = await Promise.all([
      this.prisma.sale.findMany({
        where: {
          livestock: { farmId },
          saleDate: { gte: start, lte: end },
        },
        select: { saleAmount: true },
      }),
      this.prisma.saleListing.findMany({
        where: {
          farmId,
          status: 'sold',
          saleDate: { gte: start, lte: end },
        },
        select: { saleAmount: true, price: true },
      }),
    ]);

    const totalRevenue = [
      ...livestockSales.map((s) => s.saleAmount),
      ...saleListings.map((s) => s.saleAmount || s.price || 0),
    ].reduce((sum, amount) => sum + amount, 0);

    // Get expense data
    const [feedExpenses, healthExpenses, salaryExpenses, breedingExpenses] =
      await Promise.all([
        this.prisma.feedDetails.findMany({
          where: {
            feedingProgram: { farmId },
            date: { gte: start, lte: end },
          },
          select: { cost: true },
        }),
        Promise.all([
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
          this.prisma.boosterRecord.findMany({
            where: {
              farmId,
              dateAdministered: { gte: start, lte: end },
            },
            select: { costOfBooster: true },
          }),
        ]),
        this.prisma.employee.findMany({
          where: {
            farms: { some: { farmId } },
            dateOfEmployment: { lte: end },
            OR: [{ endDate: null }, { endDate: { gte: start } }],
          },
          select: { salary: true, paymentSchedule: true },
        }),
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

    const [vaccinations, treatments, boosters] = healthExpenses;
    const healthCosts = [
      ...vaccinations.map(
        (v) => (v.costOfVaccine || 0) + (v.costOfService || 0),
      ),
      ...treatments.map((t) => (t.costOfDrugs || 0) + (t.costOfService || 0)),
      ...boosters.map((b) => b.costOfBooster || 0),
    ].reduce((sum, cost) => sum + cost, 0);

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

    const totalExpenses = feedCosts + healthCosts + salaryCosts + breedingCosts;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin =
      totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Simple cash flow calculation (revenue - operating expenses)
    const cashFlow = totalRevenue - (feedCosts + healthCosts);

    return {
      period,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      totalRevenue,
      totalExpenses,
      netProfit,
      cashFlow,
      profitMargin: Math.round(profitMargin * 100) / 100,
    };
  }

  async getChartOfAccounts(query: FinancialReportQueryDto) {
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

    // ASSETS - Current Assets
    // 1205 - Goods in Stock
    const goodsInStock = await this.prisma.goodsInStock.findMany({
      where: { inventory: { farmId } },
      select: { purchasePrice: true },
    });
    const goodsInStockValue = goodsInStock.reduce(
      (sum, item) => sum + (item.purchasePrice || 0),
      0,
    );

    // 1200 - Cash/Bank (from sales)
    const [salesData, saleListingsData] = await Promise.all([
      this.prisma.sale.findMany({
        where: {
          livestock: { farmId },
          saleDate: { gte: start, lte: end },
        },
        select: { saleAmount: true },
      }),
      this.prisma.saleListing.findMany({
        where: {
          farmId,
          status: 'sold',
          saleDate: { gte: start, lte: end },
        },
        select: {
          saleAmount: true,
          price: true,
          pricePerBird: true,
          salePrice: true,
          quantity: true,
        },
      }),
    ]);

    const directSales = salesData.reduce(
      (sum, sale) => sum + sale.saleAmount,
      0,
    );
    const listingSales = saleListingsData.reduce((sum, listing) => {
      const amount =
        listing.saleAmount ||
        listing.salePrice ||
        (listing.pricePerBird && listing.quantity
          ? listing.pricePerBird * listing.quantity
          : 0) ||
        listing.price;
      return sum + (amount || 0);
    }, 0);
    const cashBankBalance = directSales + listingSales;

    // ASSETS - Non-Current Assets
    // 1300 - Livestock (current value + newborns)
    const livestockValue = await this.prisma.saleListing.findMany({
      where: { farmId, status: { in: ['available', 'reserved'] } },
      select: { price: true, quantity: true },
    });
    const currentLivestockValue = livestockValue.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0,
    );

    // Add value of newborn offspring
    const newborns = await this.prisma.breedingRecord.findMany({
      where: {
        farmId,
        birthRecorded: true,
        birthDate: { gte: start, lte: end },
      },
      select: { youngOnes: true },
    });
    const newbornValue = newborns.reduce((sum, record) => {
      const estimatedValuePerCalf = 10000; // This should be configurable
      return sum + (record.youngOnes || 0) * estimatedValuePerCalf;
    }, 0);
    const totalLivestockValue = currentLivestockValue + newbornValue;

    // 1400 - Water
    const waterAssets = await this.prisma.water.findMany({
      where: { inventory: { farmId } },
      select: { waterConstructionCost: true },
    });
    const waterValue = waterAssets.reduce(
      (sum, water) => sum + (water.waterConstructionCost || 0),
      0,
    );

    // 1500 - Power
    const powerAssets = await this.prisma.power.findMany({
      where: { inventory: { farmId } },
      select: { powerInstallationCost: true },
    });
    const powerValue = powerAssets.reduce(
      (sum, power) => sum + (power.powerInstallationCost || 0),
      0,
    );

    // 1600 - Facilities
    const facilities = await this.prisma.utility.findMany({
      where: { inventory: { farmId } },
      select: { constructionCost: true },
    });
    const facilitiesValue = facilities.reduce(
      (sum, facility) => sum + (facility.constructionCost || 0),
      0,
    );

    // 1700 - Machinery
    const machinery = await this.prisma.machinery.findMany({
      where: { inventory: { farmId } },
      select: { purchasePrice: true },
    });
    const machineryValue = machinery.reduce(
      (sum, machine) => sum + (machine.purchasePrice || 0),
      0,
    );

    // REVENUE
    const revenueData = await this.calculateRevenueByCategory(
      farmId,
      start,
      end,
    );

    // EXPENSES
    const expenseData = await this.calculateExpensesByCategory(
      farmId,
      start,
      end,
    );

    // LIABILITIES
    const liabilityData = await this.calculateLiabilities(farmId, start, end);

    return {
      period,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      assets: {
        current: [
          {
            name: 'Goods in Stock',
            code: '1205',
            balance: goodsInStockValue,
            type: 'debit',
          },
          {
            name: 'Cash/Bank',
            code: '1200',
            balance: cashBankBalance,
            type: 'debit',
          },
        ],
        nonCurrent: [
          {
            name: 'Livestock',
            code: '1300',
            balance: totalLivestockValue,
            type: 'debit',
          },
          {
            name: 'Water',
            code: '1400',
            balance: waterValue,
            type: 'debit',
          },
          {
            name: 'Power',
            code: '1500',
            balance: powerValue,
            type: 'debit',
          },
          {
            name: 'Facilities',
            code: '1600',
            balance: facilitiesValue,
            type: 'debit',
          },
          {
            name: 'Machinery',
            code: '1700',
            balance: machineryValue,
            type: 'debit',
          },
        ],
      },
      revenue: revenueData,
      expenses: expenseData,
      liabilities: liabilityData,
    };
  }

  private async calculateRevenueByCategory(
    farmId: string,
    start: Date,
    end: Date,
  ) {
    // Get all sales by category
    const salesByCategory = await this.prisma.saleListing.findMany({
      where: {
        farmId,
        status: 'sold',
        saleDate: { gte: start, lte: end },
      },
      select: {
        category: true,
        saleAmount: true,
        salePrice: true,
        price: true,
        pricePerBird: true,
        quantity: true,
      },
    });

    const revenue = [
      { name: 'DairySales', code: '4100', balance: 0, type: 'credit' },
      { name: 'BeefSales', code: '4200', balance: 0, type: 'credit' },
      { name: 'GoatMilk', code: '4300', balance: 0, type: 'credit' },
      { name: 'GoatMeat', code: '4310', balance: 0, type: 'credit' },
      { name: 'SheepWool', code: '4320', balance: 0, type: 'credit' },
      { name: 'SheepMeat', code: '4330', balance: 0, type: 'credit' },
      { name: 'LiveAnimals', code: '4340', balance: 0, type: 'credit' },
      { name: 'EggSales', code: '4350', balance: 0, type: 'credit' },
      { name: 'BroilerSales', code: '4360', balance: 0, type: 'credit' },
      { name: 'Rabbits', code: '4370', balance: 0, type: 'credit' },
      { name: 'PigSales', code: '4380', balance: 0, type: 'credit' },
    ];

    salesByCategory.forEach((sale) => {
      const amount =
        sale.saleAmount ||
        sale.salePrice ||
        (sale.pricePerBird && sale.quantity
          ? sale.pricePerBird * sale.quantity
          : 0) ||
        sale.price ||
        0;

      switch (sale.category?.toLowerCase()) {
        case 'dairycattle':
          revenue.find((r) => r.code === '4100').balance += amount;
          break;
        case 'beefcattle':
          revenue.find((r) => r.code === '4200').balance += amount;
          break;
        case 'dairygoats':
          revenue.find((r) => r.code === '4300').balance += amount;
          break;
        case 'meatgoats':
          revenue.find((r) => r.code === '4310').balance += amount;
          break;
        case 'sheep':
          // Determine if wool or meat based on additional context
          revenue.find((r) => r.code === '4330').balance += amount; // Default to meat
          break;
        case 'poultry':
          // Determine if eggs or broiler based on additional context
          revenue.find((r) => r.code === '4360').balance += amount; // Default to broiler
          break;
        case 'rabbits':
          revenue.find((r) => r.code === '4370').balance += amount;
          break;
        case 'swine':
          revenue.find((r) => r.code === '4380').balance += amount;
          break;
        default:
          revenue.find((r) => r.code === '4340').balance += amount; // Live animals
      }
    });

    return revenue.filter((r) => r.balance > 0);
  }

  private async calculateExpensesByCategory(
    farmId: string,
    start: Date,
    end: Date,
  ) {
    // 5100 - Feeding (cost from feedDetails)
    const feedingExpenses = await this.prisma.feedDetails.findMany({
      where: {
        feedingProgram: { farmId },
        date: { gte: start, lte: end },
      },
      select: { cost: true },
    });
    const feedingTotal = feedingExpenses.reduce(
      (sum, feed) => sum + (feed.cost || 0),
      0,
    );

    // 5200 - Health (all health-related costs)
    const [treatments, vaccinations, dewormings, boosters] = await Promise.all([
      this.prisma.treatmentRecord.findMany({
        where: {
          farmId,
          dateAdministered: { gte: start, lte: end },
        },
        select: { costOfDrugs: true, costOfService: true },
      }),
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
      this.prisma.boosterRecord.findMany({
        where: {
          farmId,
          dateAdministered: { gte: start, lte: end },
        },
        select: { costOfBooster: true },
      }),
    ]);

    const healthTotal = [
      ...treatments.map((t) => (t.costOfDrugs || 0) + (t.costOfService || 0)),
      ...vaccinations.map(
        (v) => (v.costOfVaccine || 0) + (v.costOfService || 0),
      ),
      ...dewormings.map((d) => (d.costOfVaccine || 0) + (d.costOfService || 0)),
      ...boosters.map((b) => b.costOfBooster || 0),
    ].reduce((sum, cost) => sum + cost, 0);

    // 5300 - Breeding (AI costs)
    const breedingExpenses = await this.prisma.breedingRecord.findMany({
      where: {
        farmId,
        serviceDate: { gte: start, lte: end },
      },
      select: { aiCost: true },
    });
    const breedingTotal = breedingExpenses.reduce(
      (sum, breeding) => sum + (breeding.aiCost || 0),
      0,
    );

    // 5400 - Inventory (maintenance costs)
    const [powerMaintenance, utilityMaintenance] = await Promise.all([
      this.prisma.power.findMany({
        where: { inventory: { farmId } },
        select: { consumptionCost: true },
      }),
      this.prisma.utility.findMany({
        where: { inventory: { farmId } },
        select: { maintenanceCost: true },
      }),
    ]);

    const inventoryTotal = [
      ...powerMaintenance.map((p) => p.consumptionCost || 0),
      ...utilityMaintenance.map((u) => u.maintenanceCost || 0),
    ].reduce((sum, cost) => sum + cost, 0);

    // 5600 - Employees (salaries and wages)
    const employees = await this.prisma.employee.findMany({
      where: {
        farms: { some: { farmId } },
        dateOfEmployment: { lte: end },
        OR: [{ endDate: null }, { endDate: { gte: start } }],
      },
      select: { salary: true, paymentSchedule: true },
    });

    const monthsInPeriod = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30),
    );
    const employeeTotal = employees.reduce((sum, emp) => {
      const monthlySalary =
        emp.paymentSchedule === 'Monthly' ? emp.salary : emp.salary / 12;
      return sum + monthlySalary * monthsInPeriod;
    }, 0);

    const expenses = [
      { name: 'Feeding', code: '5100', balance: feedingTotal, type: 'debit' },
      { name: 'Health', code: '5200', balance: healthTotal, type: 'debit' },
      { name: 'Breeding', code: '5300', balance: breedingTotal, type: 'debit' },
      {
        name: 'Inventory',
        code: '5400',
        balance: inventoryTotal,
        type: 'debit',
      },
      {
        name: 'Employees',
        code: '5600',
        balance: employeeTotal,
        type: 'debit',
      },
    ];

    return expenses.filter((e) => e.balance > 0);
  }

  private async calculateLiabilities(farmId: string, start: Date, end: Date) {
    // Get employee benefits (payables)
    const employeeBenefits = await this.prisma.employeeBenefit.findMany({
      where: {
        employee: {
          farms: { some: { farmId } },
        },
      },
      select: { name: true, amount: true },
    });

    const liabilities = [
      { name: 'PAYE', code: '2100', balance: 0, type: 'credit' },
      { name: 'NSSF', code: '2200', balance: 0, type: 'credit' },
      { name: 'Housing Levy', code: '2300', balance: 0, type: 'credit' },
      { name: 'SACCOs', code: '2400', balance: 0, type: 'credit' },
      { name: 'NITA', code: '2500', balance: 0, type: 'credit' },
      { name: 'SHIF', code: '2600', balance: 0, type: 'credit' },
    ];

    employeeBenefits.forEach((benefit) => {
      const amount = benefit.amount || 0;
      switch (benefit.name?.toUpperCase()) {
        case 'PAYE':
          liabilities.find((l) => l.code === '2100').balance += amount;
          break;
        case 'NSSF':
          liabilities.find((l) => l.code === '2200').balance += amount;
          break;
        case 'HOUSING LEVY':
          liabilities.find((l) => l.code === '2300').balance += amount;
          break;
        case 'SACCOS':
          liabilities.find((l) => l.code === '2400').balance += amount;
          break;
        case 'NITA':
          liabilities.find((l) => l.code === '2500').balance += amount;
          break;
        case 'SHIF':
          liabilities.find((l) => l.code === '2600').balance += amount;
          break;
      }
    });

    return liabilities.filter((l) => l.balance > 0);
  }

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

  async getSalesJournal(query: FinancialReportQueryDto) {
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

    const entries = [];
    let entryId = 1;

    // Get sales from SaleListing table
    const saleListings = await this.prisma.saleListing.findMany({
      where: {
        farmId,
        status: 'sold',
        OR: [
          { saleDate: { gte: start, lte: end } },
          {
            saleDate: null,
            createdAt: { gte: start, lte: end },
          },
        ],
      },
      orderBy: [{ saleDate: 'asc' }, { createdAt: 'asc' }],
    });

    saleListings.forEach((sale) => {
      const amount = sale.saleAmount || sale.salePrice || sale.price || 0;
      if (amount > 0) {
        const saleDate = sale.saleDate || sale.createdAt;
        const reference =
          sale.receiptNumber || `INV-${String(entryId).padStart(3, '0')}`;
        const accountMapping = {
          dairycattle: 'DairySales',
          beefcattle: 'BeefSales',
          dairygoats: 'GoatMilk',
          meatgoats: 'GoatMeat',
          sheep: 'SheepMeat',
          poultry: 'EggSales',
          rabbits: 'Rabbits',
          swine: 'PigSales',
        };

        const creditAccount =
          accountMapping[sale.category?.toLowerCase()] || 'LiveAnimals';

        // Debit entry (Cash/Bank)
        entries.push({
          id: entryId++,
          date: saleDate.toISOString().split('T')[0],
          reference,
          description: `Sale of ${sale.quantity || 1} ${sale.category || 'livestock'}`,
          account: 'Cash/Bank',
          debit: amount,
          credit: null,
        });

        // Credit entry (Revenue account)
        entries.push({
          id: entryId++,
          date: saleDate.toISOString().split('T')[0],
          reference,
          description: `Sale of ${sale.quantity || 1} ${sale.category || 'livestock'}`,
          account: creditAccount,
          debit: null,
          credit: amount,
        });
      }
    });

    // Get direct livestock sales
    const directSales = await this.prisma.sale.findMany({
      where: {
        livestock: { farmId },
        saleDate: { gte: start, lte: end },
      },
      include: { livestock: true },
      orderBy: { saleDate: 'asc' },
    });

    directSales.forEach((sale) => {
      if (sale.saleAmount > 0) {
        const reference =
          sale.receiptNumber || `INV-${String(entryId).padStart(3, '0')}`;
        const creditAccount =
          sale.livestock.category === 'mammal' ? 'DairySales' : 'EggSales';

        // Debit entry (Cash/Bank)
        entries.push({
          id: entryId++,
          date: sale.saleDate.toISOString().split('T')[0],
          reference,
          description: `Sale of ${sale.livestock.type}`,
          account: 'Cash/Bank',
          debit: sale.saleAmount,
          credit: null,
        });

        // Credit entry (Revenue account)
        entries.push({
          id: entryId++,
          date: sale.saleDate.toISOString().split('T')[0],
          reference,
          description: `Sale of ${sale.livestock.type}`,
          account: creditAccount,
          debit: null,
          credit: sale.saleAmount,
        });
      }
    });

    const totalDebits = entries.reduce(
      (sum, entry) => sum + (entry.debit || 0),
      0,
    );
    const totalCredits = entries.reduce(
      (sum, entry) => sum + (entry.credit || 0),
      0,
    );

    return {
      period,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      entries,
      totals: {
        totalDebits,
        totalCredits,
        entryCount: entries.length,
      },
    };
  }

  async getPurchasesJournal(query: FinancialReportQueryDto) {
    const {
      farmId,
      period = ReportPeriod.THIS_MONTH,
      startDate,
      endDate,
    } = query;
    const { start, end } = this.getDateRange(period, startDate, endDate);

    const entries = [];
    let entryId = 1;

    // Feed purchases
    const feedPurchases = await this.prisma.feedDetails.findMany({
      where: {
        feedingProgram: { farmId },
        date: { gte: start, lte: end },
        cost: { gt: 0 },
      },
      orderBy: { date: 'asc' },
    });

    feedPurchases.forEach((feed) => {
      const reference = `FEED-${String(entryId).padStart(3, '0')}`;

      // Debit entry (Feeding expense)
      entries.push({
        id: entryId++,
        date: feed.date.toISOString().split('T')[0],
        reference,
        description: `Purchase of ${feed.feedName || feed.feedType}`,
        supplier: feed.supplier || 'Unknown Supplier',
        account: 'Feeding',
        debit: feed.cost,
        credit: null,
      });

      // Credit entry (Cash/Bank)
      entries.push({
        id: entryId++,
        date: feed.date.toISOString().split('T')[0],
        reference,
        description: `Payment for ${feed.feedName || feed.feedType}`,
        supplier: feed.supplier || 'Unknown Supplier',
        account: 'Cash/Bank',
        debit: null,
        credit: feed.cost,
      });
    });

    // Health expenses - Treatments
    const treatments = await this.prisma.treatmentRecord.findMany({
      where: {
        farmId,
        dateAdministered: { gte: start, lte: end },
        OR: [{ costOfDrugs: { gt: 0 } }, { costOfService: { gt: 0 } }],
      },
      orderBy: { dateAdministered: 'asc' },
    });

    treatments.forEach((treatment) => {
      const drugCost = treatment.costOfDrugs || 0;
      const serviceCost = treatment.costOfService || 0;
      const totalCost = drugCost + serviceCost;

      if (totalCost > 0) {
        const reference =
          treatment.licenseId || `TREAT-${String(entryId).padStart(3, '0')}`;

        // Debit entry (Health expense)
        entries.push({
          id: entryId++,
          date: treatment.dateAdministered.toISOString().split('T')[0],
          reference,
          description: `Treatment: ${treatment.diagnosis}`,
          supplier: treatment.medicalOfficerName || 'Medical Officer',
          account: 'Health',
          debit: totalCost,
          credit: null,
        });

        // Credit entry (Cash/Bank)
        entries.push({
          id: entryId++,
          date: treatment.dateAdministered.toISOString().split('T')[0],
          reference,
          description: `Payment for treatment: ${treatment.diagnosis}`,
          supplier: treatment.medicalOfficerName || 'Medical Officer',
          account: 'Cash/Bank',
          debit: null,
          credit: totalCost,
        });
      }
    });

    const totalDebits = entries.reduce(
      (sum, entry) => sum + (entry.debit || 0),
      0,
    );
    const totalCredits = entries.reduce(
      (sum, entry) => sum + (entry.credit || 0),
      0,
    );

    return {
      period,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      entries,
      totals: {
        totalDebits,
        totalCredits,
        entryCount: entries.length,
      },
    };
  }

  async getAssetsJournal(query: FinancialReportQueryDto) {
    const {
      farmId,
      period = ReportPeriod.THIS_MONTH,
      startDate,
      endDate,
    } = query;
    const { start, end } = this.getDateRange(period, startDate, endDate);

    const entries = [];
    let entryId = 1;

    // Machinery purchases
    const machinery = await this.prisma.machinery.findMany({
      where: {
        inventory: { farmId },
        purchaseDate: { gte: start, lte: end },
        purchasePrice: { gt: 0 },
      },
      orderBy: { purchaseDate: 'asc' },
    });

    machinery.forEach((machine) => {
      const reference =
        machine.equipmentId || `MACH-${String(entryId).padStart(3, '0')}`;

      // Debit entry (Machinery asset)
      entries.push({
        id: entryId++,
        date: machine.purchaseDate.toISOString().split('T')[0],
        reference,
        description: `${machine.equipmentName}`,
        account: 'Machinery',
        debit: machine.purchasePrice,
        credit: null,
      });

      // Credit entry (Cash/Bank)
      entries.push({
        id: entryId++,
        date: machine.purchaseDate.toISOString().split('T')[0],
        reference,
        description: `Payment for ${machine.equipmentName}`,
        account: 'Cash/Bank',
        debit: null,
        credit: machine.purchasePrice,
      });
    });

    // Water system installations
    const waterSystems = await this.prisma.water.findMany({
      where: {
        inventory: { farmId },
        waterConstructionCost: { gt: 0 },
      },
    });

    waterSystems.forEach((water) => {
      const reference = `WATER-${String(entryId).padStart(3, '0')}`;
      const date = water.waterEntryDate || new Date();

      // Debit entry (Water asset)
      entries.push({
        id: entryId++,
        date: date.toISOString().split('T')[0],
        reference,
        description: `${water.waterSource} installation`,
        account: 'Water',
        debit: water.waterConstructionCost,
        credit: null,
      });

      // Credit entry (Cash/Bank)
      entries.push({
        id: entryId++,
        date: date.toISOString().split('T')[0],
        reference,
        description: `Payment for ${water.waterSource}`,
        account: 'Cash/Bank',
        debit: null,
        credit: water.waterConstructionCost,
      });
    });

    const totalDebits = entries.reduce(
      (sum, entry) => sum + (entry.debit || 0),
      0,
    );
    const totalCredits = entries.reduce(
      (sum, entry) => sum + (entry.credit || 0),
      0,
    );

    return {
      period,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      entries,
      totals: {
        totalDebits,
        totalCredits,
        entryCount: entries.length,
      },
    };
  }

  async getPayrollJournal(query: FinancialReportQueryDto) {
    const {
      farmId,
      period = ReportPeriod.THIS_MONTH,
      startDate,
      endDate,
    } = query;
    const { start, end } = this.getDateRange(period, startDate, endDate);

    const entries = [];
    let entryId = 1;

    // Get active employees for the period
    const employees = await this.prisma.employee.findMany({
      where: {
        farms: { some: { farmId } },
        dateOfEmployment: { lte: end },
        OR: [{ endDate: null }, { endDate: { gte: start } }],
      },
      include: { benefits: true },
    });

    if (employees.length > 0) {
      const monthYear = end
        .toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        .toUpperCase();
      const reference = `PAY-${monthYear}`;
      const payrollDate = new Date(end.getFullYear(), end.getMonth(), 30);

      // Calculate totals
      const totalSalaries = employees.reduce((sum, emp) => {
        const monthlySalary =
          emp.paymentSchedule === 'Monthly' ? emp.salary : emp.salary / 12;
        return sum + monthlySalary;
      }, 0);

      // Gross salary entry
      entries.push({
        id: entryId++,
        date: payrollDate.toISOString().split('T')[0],
        reference,
        description: `${monthYear} Payroll - Gross Salaries`,
        account: 'Salaries and Wages',
        debit: totalSalaries,
        credit: null,
        type: 'Expense',
      });

      // Calculate benefit deductions
      const benefitTotals = {
        PAYE: 0,
        NSSF: 0,
        'Housing Levy': 0,
        SACCOs: 0,
        NITA: 0,
        SHIF: 0,
      };

      employees.forEach((employee) => {
        employee.benefits.forEach((benefit) => {
          if (benefitTotals.hasOwnProperty(benefit.name)) {
            benefitTotals[benefit.name] += benefit.amount || 0;
          }
        });
      });

      // Create liability entries for each benefit type
      Object.entries(benefitTotals).forEach(([benefitName, amount]) => {
        if (amount > 0) {
          entries.push({
            id: entryId++,
            date: payrollDate.toISOString().split('T')[0],
            reference,
            description: `${monthYear} ${benefitName} Deduction`,
            account: `${benefitName} Payable`,
            debit: null,
            credit: amount,
            type: 'Liability',
          });
        }
      });

      // Net pay entry
      const totalDeductions = Object.values(benefitTotals).reduce(
        (sum, amount) => sum + amount,
        0,
      );
      const netPay = totalSalaries - totalDeductions;

      if (netPay > 0) {
        entries.push({
          id: entryId++,
          date: payrollDate.toISOString().split('T')[0],
          reference,
          description: `${monthYear} Net Pay`,
          account: 'Cash/Bank',
          debit: null,
          credit: netPay,
          type: 'Asset',
        });
      }
    }

    const totalDebits = entries.reduce(
      (sum, entry) => sum + (entry.debit || 0),
      0,
    );
    const totalCredits = entries.reduce(
      (sum, entry) => sum + (entry.credit || 0),
      0,
    );

    return {
      period,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      entries,
      totals: {
        totalDebits,
        totalCredits,
        entryCount: entries.length,
      },
    };
  }

  async getGeneralJournal(query: FinancialReportQueryDto) {
    const {
      farmId,
      period = ReportPeriod.THIS_MONTH,
      startDate,
      endDate,
    } = query;
    const { start, end } = this.getDateRange(period, startDate, endDate);

    const entries = [];
    let entryId = 1;

    // Biological gains from breeding records (newborn livestock)
    const newborns = await this.prisma.breedingRecord.findMany({
      where: {
        farmId,
        birthRecorded: true,
        birthDate: { gte: start, lte: end },
      },
      include: { offspring: true },
      orderBy: { birthDate: 'asc' },
    });

    newborns.forEach((breeding) => {
      if (breeding.youngOnes && breeding.youngOnes > 0) {
        breeding.offspring.forEach((offspring) => {
          const reference =
            offspring.offspringId || `BIO-${String(entryId).padStart(3, '0')}`;
          const animalType = this.getAnimalType(breeding.purpose);
          const estimatedValue = 10000; // This should be configurable

          // Debit entry (Livestock asset)
          entries.push({
            id: entryId++,
            date: breeding.birthDate.toISOString().split('T')[0],
            reference,
            description: `Newborn ${animalType} - ${offspring.offspringId}`,
            account: 'Livestock',
            debit: estimatedValue,
            credit: null,
          });

          // Credit entry (Other Income)
          entries.push({
            id: entryId++,
            date: breeding.birthDate.toISOString().split('T')[0],
            reference,
            description: `Biological gain - ${animalType}`,
            account: 'Other Income',
            debit: null,
            credit: estimatedValue,
          });
        });
      }
    });

    const totalDebits = entries.reduce(
      (sum, entry) => sum + (entry.debit || 0),
      0,
    );
    const totalCredits = entries.reduce(
      (sum, entry) => sum + (entry.credit || 0),
      0,
    );

    return {
      period,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      entries,
      totals: {
        totalDebits,
        totalCredits,
        entryCount: entries.length,
      },
    };
  }

  async getGeneralLedger(query: FinancialReportQueryDto) {
    const chartOfAccounts = await this.getChartOfAccounts(query);

    // Convert chart of accounts to ledger format
    const accounts = [];

    // Add assets
    chartOfAccounts.assets.current.forEach((account) => {
      accounts.push({
        account: account.name,
        debit: account.balance > 0 ? account.balance : 0,
        credit: account.balance < 0 ? Math.abs(account.balance) : 0,
        balance: account.balance,
        accountType: 'Assets',
      });
    });

    chartOfAccounts.assets.nonCurrent.forEach((account) => {
      accounts.push({
        account: account.name,
        debit: account.balance > 0 ? account.balance : 0,
        credit: account.balance < 0 ? Math.abs(account.balance) : 0,
        balance: account.balance,
        accountType: 'Assets',
      });
    });

    // Add revenue
    chartOfAccounts.revenue.forEach((account) => {
      accounts.push({
        account: account.name,
        debit: 0,
        credit: account.balance,
        balance: -account.balance,
        accountType: 'Revenue',
      });
    });

    // Add expenses
    chartOfAccounts.expenses.forEach((account) => {
      accounts.push({
        account: account.name,
        debit: account.balance,
        credit: 0,
        balance: account.balance,
        accountType: 'Expenses',
      });
    });

    // Add liabilities
    chartOfAccounts.liabilities.forEach((account) => {
      accounts.push({
        account: account.name,
        debit: 0,
        credit: account.balance,
        balance: -account.balance,
        accountType: 'Liabilities',
      });
    });

    const totalDebits = accounts.reduce((sum, acc) => sum + acc.debit, 0);
    const totalCredits = accounts.reduce((sum, acc) => sum + acc.credit, 0);

    return {
      period: chartOfAccounts.period,
      startDate: chartOfAccounts.startDate,
      endDate: chartOfAccounts.endDate,
      accounts,
      totals: {
        totalDebits,
        totalCredits,
        isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
        variance: totalDebits - totalCredits,
      },
    };
  }

  private getAnimalType(purpose: string): string {
    const purposeMap = {
      dairy: 'calf',
      beef: 'calf',
      goat: 'kid',
      sheep: 'lamb',
      swine: 'piglet',
      poultry: 'chick',
      rabbit: 'kit',
    };

    const lowerPurpose = purpose?.toLowerCase() || '';
    for (const [key, value] of Object.entries(purposeMap)) {
      if (lowerPurpose.includes(key)) {
        return value;
      }
    }
    return 'offspring';
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
          OR: [
            { saleDate: { gte: start, lte: end } },
            {
              saleDate: null,
              createdAt: { gte: start, lte: end },
            },
          ],
        },
        select: { saleAmount: true, salePrice: true, price: true },
      }),
    ]);

    const dairySales = livestockSales.reduce(
      (sum, sale) => sum + sale.saleAmount,
      0,
    );
    const beefSales = saleListings.reduce(
      (sum, listing) =>
        sum + (listing.saleAmount || listing.salePrice || listing.price || 0),
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
      Promise.all([
        this.prisma.sale.findMany({
          where: {
            livestock: { farmId },
            saleDate: { gte: start, lte: end },
          },
          select: { saleAmount: true },
        }),
        this.prisma.saleListing.findMany({
          where: {
            farmId,
            status: 'sold',
            OR: [
              { saleDate: { gte: start, lte: end } },
              {
                saleDate: null,
                createdAt: { gte: start, lte: end },
              },
            ],
          },
          select: { saleAmount: true, salePrice: true, price: true },
        }),
      ]),
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

    const [directSales, listingSales] = salesInflows;
    const operatingInflows = [
      ...directSales.map((s) => s.saleAmount),
      ...listingSales.map((s) => s.saleAmount || s.salePrice || s.price || 0),
    ].reduce((sum, amount) => sum + amount, 0);

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
    const [utilities, water, power] = await Promise.all([
      this.prisma.utility.findMany({
        where: { inventory: { farmId } },
        select: { constructionCost: true },
      }),
      this.prisma.water.findMany({
        where: { inventory: { farmId } },
        select: { waterConstructionCost: true },
      }),
      this.prisma.power.findMany({
        where: { inventory: { farmId } },
        select: { powerInstallationCost: true },
      }),
    ]);

    const investingOutflows = [
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
    ].filter((item) => item.amount > 0);

    const netInvestingCash = -investingOutflows.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
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
        outflows: investingOutflows,
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

    // Get profit and loss data to calculate balances
    const profitLoss = await this.getProfitAndLoss(query);
    const cashBalance = profitLoss.netProfit; // Simplified assumption

    accounts.push({
      account: 'Cash/Bank',
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

    if (profitLoss.revenue.beefSales > 0) {
      accounts.push({
        account: 'Beef Sales',
        debit: 0,
        credit: profitLoss.revenue.beefSales,
        balance: -profitLoss.revenue.beefSales,
      });
    }

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
    const [utilities, water, power, machinery, goodsInStock] =
      await Promise.all([
        this.prisma.utility.findMany({
          where: { inventory: { farmId } },
          select: { constructionCost: true },
        }),
        this.prisma.water.findMany({
          where: { inventory: { farmId } },
          select: { waterConstructionCost: true },
        }),
        this.prisma.power.findMany({
          where: { inventory: { farmId } },
          select: { powerInstallationCost: true },
        }),
        this.prisma.machinery.findMany({
          where: { inventory: { farmId } },
          select: { purchasePrice: true },
        }),
        this.prisma.goodsInStock.findMany({
          where: { inventory: { farmId } },
          select: { purchasePrice: true },
        }),
      ]);

    const infrastructureValue = [
      ...utilities.map((u) => u.constructionCost || 0),
      ...water.map((w) => w.waterConstructionCost || 0),
      ...power.map((p) => p.powerInstallationCost || 0),
    ].reduce((sum, cost) => sum + cost, 0);

    const machineryValue = machinery.reduce(
      (sum, m) => sum + (m.purchasePrice || 0),
      0,
    );
    const goodsValue = goodsInStock.reduce(
      (sum, g) => sum + (g.purchasePrice || 0),
      0,
    );

    // Get current cash position (simplified)
    const profitLoss = await this.getProfitAndLoss(query);
    const cashPosition = Math.max(0, profitLoss.netProfit);

    // Assets
    const currentAssets = {
      cashAndBank: cashPosition,
      goodsInStock: goodsValue,
      total: cashPosition + goodsValue,
    };

    const nonCurrentAssets = {
      livestock: livestockValue,
      machinery: machineryValue,
      infrastructure: infrastructureValue,
      total: livestockValue + machineryValue + infrastructureValue,
    };

    const totalAssets = currentAssets.total + nonCurrentAssets.total;

    // For now, we'll assume no liabilities in the current schema
    const totalLiabilities = 0;
    const totalEquity = totalAssets; // Assets = Equity (no liabilities)

    return {
      period: query.period,
      assets: {
        currentAssets,
        nonCurrentAssets,
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
