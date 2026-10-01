import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AnalyticsQueryDto,
  LivestockAnalyticsQueryDto,
  EmployeeAnalyticsQueryDto,
  AnalyticsPeriod,
} from './dto/analytics-query.dto';
import {
  ProductionAnalyticsQueryDto,
  FinancialTrendsQueryDto,
  KPIQueryDto,
} from './dto/specialized-analytics.dto';
import { LandPreparationAnalyticsQueryDto } from './dto/land-preparation-analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * A deliberately read-only adapter for the mobile land-preparation dashboard.
   * Activity CRUD endpoints retain their original response shapes; this method
   * keeps chart-facing labels and filters in one stable, efficient response.
   */
  async getLandPreparationAnalytics(
    query: LandPreparationAnalyticsQueryDto,
    user: { id: string; userType?: string },
  ) {
    const { farmId, cycleId, cropId, startDate, endDate } = query;
    const start = startDate ? this.toStartOfDay(startDate) : undefined;
    const end = endDate ? this.toEndOfDay(endDate) : undefined;

    if (start && end && start > end) {
      throw new BadRequestException('startDate must be on or before endDate');
    }

    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
      select: { id: true, userId: true },
    });
    if (!farm) throw new NotFoundException('Farm not found');

    await this.assertFarmAccess(farm, user);

    if (cycleId) {
      const cycle = await this.prisma.cropCycle.findFirst({
        where: { id: cycleId, farmId },
        select: { id: true },
      });
      if (!cycle)
        throw new NotFoundException('Crop cycle not found for this farm');
    }

    if (cropId) {
      const crop = await this.prisma.crop.findFirst({
        where: {
          id: cropId,
          farmId,
          ...(cycleId ? { cycleId } : {}),
        },
        select: { id: true },
      });
      if (!crop)
        throw new NotFoundException('Crop not found for this farm or cycle');
    }

    const cropScope = {
      farmId,
      ...(cropId ? { id: cropId } : {}),
      ...(cycleId ? { cycleId } : {}),
    };
    const dateScope =
      start || end
        ? { ...(start ? { gte: start } : {}), ...(end ? { lte: end } : {}) }
        : undefined;
    const recordWhere = {
      farmId,
      ...(dateScope ? { date: dateScope } : {}),
      crop: cropScope,
    };
    const cropSelect = {
      crop: { select: { cropName: true, cycleId: true } },
    } as const;

    const [tillageRecords, soilRecords, fieldRecords, soilPreparationRecords] =
      await Promise.all([
        this.prisma.tillageRecord.findMany({
          where: recordWhere,
          include: cropSelect,
          orderBy: { date: 'asc' },
        }),
        this.prisma.soilDataRecord.findMany({
          where: recordWhere,
          include: cropSelect,
          orderBy: { date: 'asc' },
        }),
        this.prisma.fieldConditionRecord.findMany({
          where: recordWhere,
          include: cropSelect,
          orderBy: { date: 'asc' },
        }),
        this.prisma.soilPrepRecord.findMany({
          where: recordWhere,
          include: cropSelect,
          orderBy: { date: 'asc' },
        }),
      ]);

    const tillage = tillageRecords.map((record) => ({
      id: record.id,
      cropId: record.cropId,
      cropName: record.crop.cropName,
      cycleId: record.crop.cycleId,
      date: record.date,
      system: this.titleCase(record.system),
      type: this.titleCaseList(record.type),
      equipment: record.equipment,
      area: record.area,
      areaUnit: record.areaUnit,
      cost: record.cost ?? 0,
      notes: record.notes,
    }));

    const soil = soilRecords.map((record) => ({
      id: record.id,
      cropId: record.cropId,
      cropName: record.crop.cropName,
      cycleId: record.crop.cycleId,
      date: record.date,
      soilType: this.titleCase(record.soilType),
      ph: this.titleCase(record.soilPH),
      moisture: this.titleCase(record.moistureContent),
      organicMatter: this.titleCase(record.organicMatter),
      nitrogen: record.nitrogen,
      phosphorus: record.phosphorus,
      potassium: record.potassium,
    }));

    const field = fieldRecords.map((record) => ({
      id: record.id,
      cropId: record.cropId,
      cropName: record.crop.cropName,
      cycleId: record.crop.cycleId,
      date: record.date,
      topography: this.titleCase(record.topography),
      drainage: this.titleCase(record.drainage),
      residue: this.titleCase(record.previousCropResidue),
    }));

    const soilPreparation = soilPreparationRecords.map((record) => ({
      id: record.id,
      cropId: record.cropId,
      cropName: record.crop.cropName,
      cycleId: record.crop.cycleId,
      date: record.date,
      tillageType: this.titleCase(record.tillageType),
      area: record.area,
      areaUnit: record.areaUnit,
      labourType: record.labourType,
      labourCost: record.labourCost ?? 0,
      notes: record.notes,
    }));

    return {
      filters: {
        farmId,
        cycleId: cycleId ?? null,
        cropId: cropId ?? null,
        startDate: startDate ?? null,
        endDate: endDate ?? null,
      },
      summary: {
        totalTillageCost: this.round(
          tillage.reduce((sum, record) => sum + record.cost, 0),
        ),
        totalTillageArea: this.round(
          tillage.reduce((sum, record) => sum + record.area, 0),
        ),
        tillageRecords: tillage.length,
        soilTests: soil.length,
        fieldAssessments: field.length,
        soilPreparationRecords: soilPreparation.length,
      },
      tillage,
      soil,
      field,
      soilPreparation,
    };
  }

  private async assertFarmAccess(
    farm: { id: string; userId: string },
    user: { id: string; userType?: string },
  ) {
    if (user.userType === 'admin') return;
    if (user.userType === 'user' && farm.userId === user.id) return;

    if (user.userType === 'employee') {
      const assignment = await this.prisma.employeeFarm.findUnique({
        where: { employeeId_farmId: { employeeId: user.id, farmId: farm.id } },
        select: { id: true },
      });
      if (assignment) return;
    }

    throw new ForbiddenException('You do not have access to this farm');
  }

  private toStartOfDay(value: string) {
    const date = new Date(value);
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }

  private toEndOfDay(value: string) {
    const date = new Date(value);
    date.setUTCHours(23, 59, 59, 999);
    return date;
  }

  private titleCase(value: string) {
    return value
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private titleCaseList(value: string) {
    return value
      .split('|')
      .map((part) =>
        part
          .split(',')
          .map((entry) => this.titleCase(entry.trim()))
          .join(', '),
      )
      .join(' | ');
  }

  private round(value: number) {
    return Number(value.toFixed(2));
  }

  private getDateRange(
    period: AnalyticsPeriod,
    startDate?: string,
    endDate?: string,
  ) {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (period) {
      case AnalyticsPeriod.THIS_WEEK:
        start = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - now.getDay(),
        );
        break;
      case AnalyticsPeriod.THIS_MONTH:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case AnalyticsPeriod.THIS_QUARTER:
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case AnalyticsPeriod.THIS_YEAR:
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case AnalyticsPeriod.LAST_WEEK:
        start = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - now.getDay() - 7,
        );
        end = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - now.getDay() - 1,
        );
        break;
      case AnalyticsPeriod.LAST_MONTH:
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case AnalyticsPeriod.LAST_QUARTER:
        const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
        start = new Date(now.getFullYear(), lastQuarter * 3, 1);
        end = new Date(now.getFullYear(), (lastQuarter + 1) * 3, 0);
        break;
      case AnalyticsPeriod.LAST_YEAR:
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31);
        break;
      case AnalyticsPeriod.CUSTOM_RANGE:
        if (!startDate || !endDate) {
          throw new Error(
            'Start date and end date are required for custom range',
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

  async getBusinessOverview(query: AnalyticsQueryDto) {
    const {
      farmId,
      period = AnalyticsPeriod.THIS_MONTH,
      startDate,
      endDate,
    } = query;
    const { start, end } = this.getDateRange(period, startDate, endDate);

    // Verify farm exists
    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    // Get revenue data
    const salesData = await this.prisma.sale.findMany({
      where: {
        livestock: { farmId },
        saleDate: { gte: start, lte: end },
      },
      include: { livestock: true },
    });

    const saleListings = await this.prisma.saleListing.findMany({
      where: {
        farmId,
        status: 'sold',
        saleDate: { gte: start, lte: end },
      },
    });

    // Get expense data
    const feedCosts = await this.prisma.feedDetails.findMany({
      where: {
        feedingProgram: { farmId },
        date: { gte: start, lte: end },
      },
    });

    const healthCosts = await Promise.all([
      this.prisma.vaccinationRecord.findMany({
        where: { farmId, dateAdministered: { gte: start, lte: end } },
      }),
      this.prisma.dewormingRecord.findMany({
        where: { farmId, dateAdministered: { gte: start, lte: end } },
      }),
      this.prisma.treatmentRecord.findMany({
        where: { farmId, dateAdministered: { gte: start, lte: end } },
      }),
      this.prisma.boosterRecord.findMany({
        where: { farmId, dateAdministered: { gte: start, lte: end } },
      }),
    ]);

    const breedingCosts = await this.prisma.breedingRecord.findMany({
      where: { farmId, serviceDate: { gte: start, lte: end } },
    });

    // Calculate totals
    const totalRevenue =
      salesData.reduce((sum, sale) => sum + sale.saleAmount, 0) +
      saleListings.reduce((sum, listing) => sum + (listing.saleAmount || 0), 0);

    const totalFeedCosts = feedCosts.reduce(
      (sum, feed) => sum + (feed.cost || 0),
      0,
    );

    const [vaccinations, dewormings, treatments, boosters] = healthCosts;

    const vaccinationCosts = vaccinations.reduce(
      (sum, record) =>
        sum + (record.costOfVaccine || 0) + (record.costOfService || 0),
      0,
    );

    const dewormingCosts = dewormings.reduce(
      (sum, record) =>
        sum + (record.costOfVaccine || 0) + (record.costOfService || 0),
      0,
    );

    const treatmentCosts = treatments.reduce(
      (sum, record) =>
        sum + (record.costOfDrugs || 0) + (record.costOfService || 0),
      0,
    );

    const boosterCosts = boosters.reduce(
      (sum, record) => sum + (record.costOfBooster || 0),
      0,
    );

    const totalHealthCosts =
      vaccinationCosts + dewormingCosts + treatmentCosts + boosterCosts;

    const totalBreedingCosts = breedingCosts.reduce(
      (sum, breeding) => sum + (breeding.aiCost || 0),
      0,
    );

    const totalExpenses =
      totalFeedCosts + totalHealthCosts + totalBreedingCosts;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin =
      totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      period,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      revenue: {
        dairySales: 0, // Would need production tracking
        beefSales: salesData
          .filter((s) => s.livestock.type.includes('beef'))
          .reduce((sum, s) => sum + s.saleAmount, 0),
        livestockSales: totalRevenue,
        total: totalRevenue,
      },
      expenses: {
        feedCosts: totalFeedCosts,
        healthCosts: totalHealthCosts,
        breedingCosts: totalBreedingCosts,
        total: totalExpenses,
      },
      profitability: {
        grossProfit: netProfit,
        netProfit: netProfit,
        profitMargin: profitMargin,
      },
      cashFlow: {
        operating: netProfit,
        investing: 0, // Would need asset purchase tracking
        financing: 0,
      },
    };
  }

  async getLivestockAnalytics(query: LivestockAnalyticsQueryDto) {
    const {
      farmId,
      period = AnalyticsPeriod.THIS_MONTH,
      category,
      type,
    } = query;
    const { start, end } = this.getDateRange(
      period,
      query.startDate,
      query.endDate,
    );

    const whereClause: any = { farmId };
    if (category) whereClause.category = category;
    if (type) whereClause.type = type;

    const livestock = await this.prisma.livestock.findMany({
      where: whereClause,
      include: {
        mammal: true,
        poultry: true,
        sale: true,
      },
    });

    const totalAnimals = livestock.length;
    const categories = livestock.reduce((acc, animal) => {
      const key = `${animal.category}_${animal.type}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    // Calculate asset values (simplified)
    const totalValue = livestock.reduce((sum, animal) => {
      if (animal.sale) return sum + animal.sale.saleAmount;
      // Estimate value based on type
      const estimatedValues = {
        'dairy cow': 45000,
        'beef cattle': 35000,
        goat: 8000,
        sheep: 12000,
        pig: 25000,
        poultry: 800,
      };
      return sum + (estimatedValues[animal.type] || 5000);
    }, 0);

    const healthStatus = {
      healthy: livestock.filter((l) => l.status === 'active').length,
      underTreatment: 0, // Would need health event tracking
      quarantined: 0,
    };

    return {
      period,
      totalAnimals,
      totalValue,
      categories,
      managementTypes: {
        individual: livestock.filter((l) => l.category === 'mammal').length,
        flocks: livestock.filter((l) => l.category === 'poultry').length,
      },
      healthStatus,
      productionMetrics: {
        milkProduction: 0, // Would need production tracking
        eggProduction: 0,
        meatProduction: 0,
      },
    };
  }

  async getEmployeeAnalytics(query: EmployeeAnalyticsQueryDto) {
    const {
      farmId,
      period = AnalyticsPeriod.THIS_MONTH,
      employmentType,
      department,
    } = query;

    const employees = await this.prisma.employee.findMany({
      where: {
        farms: { some: { farmId } },
      },
      include: {
        benefits: true,
        farms: true,
      },
    });

    const totalEmployees = employees.length;
    const totalPayroll = employees.reduce((sum, emp) => sum + emp.salary, 0);

    // Calculate deductions (simplified)
    const nssf = Math.round(totalPayroll * 0.01);
    const sha = Math.round(totalPayroll * 0.025);
    const nita = totalEmployees * 50;
    const paye = Math.round(totalPayroll * 0.1);
    const totalDeductions = nssf + sha + nita + paye;
    const netPay = totalPayroll - totalDeductions;

    const employmentTypes = employees.reduce((acc, emp) => {
      acc[emp.employeeType] = (acc[emp.employeeType] || 0) + 1;
      return acc;
    }, {});

    const positions = employees.reduce((acc, emp) => {
      const role = emp.customRole || emp.role;
      if (!acc[role]) {
        acc[role] = { count: 0, totalWages: 0 };
      }
      acc[role].count += 1;
      acc[role].totalWages += emp.salary;
      return acc;
    }, {});

    return {
      period,
      totalEmployees,
      totalPayroll,
      totalDeductions,
      netPay,
      employmentTypes,
      positions,
      deductions: {
        nssf,
        sha,
        nita,
        paye,
      },
    };
  }

  async getBreedingAnalytics(query: AnalyticsQueryDto) {
    const { farmId, period = AnalyticsPeriod.THIS_MONTH } = query;
    const { start, end } = this.getDateRange(
      period,
      query.startDate,
      query.endDate,
    );

    const breedingRecords = await this.prisma.breedingRecord.findMany({
      where: {
        farmId,
        serviceDate: { gte: start, lte: end },
      },
      include: {
        offspring: true,
        dam: true,
        sire: true,
      },
    });

    const totalAICost = breedingRecords.reduce(
      (sum, record) => sum + (record.aiCost || 0),
      0,
    );
    const avgAICost =
      breedingRecords.length > 0 ? totalAICost / breedingRecords.length : 0;

    const purposeBreakdown = breedingRecords.reduce((acc, record) => {
      acc[record.purpose] = (acc[record.purpose] || 0) + 1;
      return acc;
    }, {});

    const servicingTypes = breedingRecords.reduce((acc, record) => {
      acc[record.serviceType] = (acc[record.serviceType] || 0) + 1;
      return acc;
    }, {});

    const successfulBreedings = breedingRecords.filter(
      (r) => r.birthRecorded && r.youngOnes > 0,
    ).length;
    const successRate =
      breedingRecords.length > 0
        ? (successfulBreedings / breedingRecords.length) * 100
        : 0;

    // Birth analytics
    const births = breedingRecords.filter((r) => r.birthRecorded);
    const totalCalves = births.reduce(
      (sum, birth) => sum + (birth.youngOnes || 0),
      0,
    );
    const avgBirthWeight =
      births.length > 0
        ? births.reduce((sum, birth) => sum + (birth.birthWeight || 0), 0) /
          births.length
        : 0;

    const deliveryMethods = births.reduce((acc, birth) => {
      const method = birth.deliveryMethod || 'Natural birth';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    return {
      period,
      aiOverview: {
        totalAICost,
        avgAICost,
        purposeBreakdown,
        servicingTypes,
        successRate,
      },
      birthAnalytics: {
        numberOfCalves: totalCalves,
        avgBirthWeight,
        deliveryMethods,
      },
      servicingDetails: {
        totalServicing: breedingRecords.length,
        successfulServicing: successfulBreedings,
        pendingResults: breedingRecords.filter((r) => !r.birthRecorded).length,
        failedServicing: breedingRecords.filter(
          (r) => r.birthRecorded && (r.youngOnes || 0) === 0,
        ).length,
      },
      costAnalysis: {
        totalCost: totalAICost,
        averageCostPerAnimal: avgAICost,
      },
    };
  }

  async getHealthAnalytics(query: AnalyticsQueryDto) {
    const { farmId, period = AnalyticsPeriod.THIS_MONTH } = query;
    const { start, end } = this.getDateRange(
      period,
      query.startDate,
      query.endDate,
    );

    // Treatment records
    const treatments = await this.prisma.treatmentRecord.findMany({
      where: {
        farmId,
        dateAdministered: { gte: start, lte: end },
      },
    });

    // Vaccination records
    const vaccinations = await this.prisma.vaccinationRecord.findMany({
      where: {
        farmId,
        dateAdministered: { gte: start, lte: end },
      },
    });

    // Deworming records
    const dewormings = await this.prisma.dewormingRecord.findMany({
      where: {
        farmId,
        dateAdministered: { gte: start, lte: end },
      },
    });

    // Booster records
    const boosters = await this.prisma.boosterRecord.findMany({
      where: {
        farmId,
        dateAdministered: { gte: start, lte: end },
      },
    });

    // Genetic disorder records
    const geneticDisorders = await this.prisma.geneticDisorderRecord.findMany({
      where: {
        farmId,
        dateRecorded: { gte: start, lte: end },
      },
    });

    const treatmentCost = treatments.reduce(
      (sum, t) => sum + (t.costOfDrugs || 0) + (t.costOfService || 0),
      0,
    );
    const vaccinationCost = vaccinations.reduce(
      (sum, v) => sum + (v.costOfVaccine || 0) + (v.costOfService || 0),
      0,
    );
    const dewormingCost = dewormings.reduce(
      (sum, d) => sum + (d.costOfVaccine || 0) + (d.costOfService || 0),
      0,
    );
    const boosterCost = boosters.reduce(
      (sum, b) => sum + (b.costOfBooster || 0),
      0,
    );

    // Incidence rates
    const treatmentIncidences = treatments.reduce((acc, t) => {
      acc[t.diagnosis] = (acc[t.diagnosis] || 0) + 1;
      return acc;
    }, {});

    const vaccinationIncidences = vaccinations.reduce((acc, v) => {
      acc[v.vaccinationAgainst] = (acc[v.vaccinationAgainst] || 0) + 1;
      return acc;
    }, {});

    const dewormingIncidences = dewormings.reduce((acc, d) => {
      acc[d.dewormingAgainst] = (acc[d.dewormingAgainst] || 0) + 1;
      return acc;
    }, {});

    return {
      period,
      treatment: {
        treatmentCost,
        totalDrugCost: treatments.reduce(
          (sum, t) => sum + (t.costOfDrugs || 0),
          0,
        ),
        totalServiceCost: treatments.reduce(
          (sum, t) => sum + (t.costOfService || 0),
          0,
        ),
        incidenceRates: treatmentIncidences,
        treatmentTypes: treatments.reduce((acc, t) => {
          acc[t.treatmentType] = (acc[t.treatmentType] || 0) + 1;
          return acc;
        }, {}),
      },
      vaccination: {
        totalExpense: vaccinationCost,
        totalVaccinesCost: vaccinations.reduce(
          (sum, v) => sum + (v.costOfVaccine || 0),
          0,
        ),
        totalServiceCost: vaccinations.reduce(
          (sum, v) => sum + (v.costOfService || 0),
          0,
        ),
        incidences: vaccinationIncidences,
      },
      deworming: {
        dewormingCost,
        totalDrugCost: dewormings.reduce(
          (sum, d) => sum + (d.costOfVaccine || 0),
          0,
        ),
        totalServiceCost: dewormings.reduce(
          (sum, d) => sum + (d.costOfService || 0),
          0,
        ),
        prevalence: dewormingIncidences,
      },
      boosters: {
        totalExpense: boosterCost,
        purposes: boosters.reduce((acc, b) => {
          acc[b.purpose] = (acc[b.purpose] || 0) + 1;
          return acc;
        }, {}),
      },
      genetic: {
        totalExpense: 0, // No cost field in genetic disorders
        disorders: geneticDisorders.reduce((acc, g) => {
          acc[g.nameOfCondition] = (acc[g.nameOfCondition] || 0) + 1;
          return acc;
        }, {}),
      },
    };
  }

  async getFeedingAnalytics(query: AnalyticsQueryDto) {
    const { farmId, period = AnalyticsPeriod.THIS_MONTH } = query;
    const { start, end } = this.getDateRange(
      period,
      query.startDate,
      query.endDate,
    );

    const feedDetails = await this.prisma.feedDetails.findMany({
      where: {
        feedingProgram: { farmId },
        date: { gte: start, lte: end },
      },
      include: {
        feedingProgram: true,
      },
    });

    const totalFeedConsumed = feedDetails.reduce(
      (sum, feed) => sum + feed.quantity,
      0,
    );
    const totalFeedExpense = feedDetails.reduce(
      (sum, feed) => sum + (feed.cost || 0),
      0,
    );

    const feedSources = feedDetails.reduce((acc, feed) => {
      acc[feed.source] = (acc[feed.source] || 0) + feed.quantity;
      return acc;
    }, {});

    const feedSchedule = feedDetails.reduce((acc, feed) => {
      acc[feed.schedule] = (acc[feed.schedule] || 0) + feed.quantity;
      return acc;
    }, {});

    const feedTypes = feedDetails.reduce((acc, feed) => {
      acc[feed.feedType] = (acc[feed.feedType] || 0) + (feed.cost || 0);
      return acc;
    }, {});

    const supplierPerformance = feedDetails.reduce((acc, feed) => {
      if (feed.supplier) {
        if (!acc[feed.supplier]) {
          acc[feed.supplier] = { totalCost: 0, totalQuantity: 0 };
        }
        acc[feed.supplier].totalCost += feed.cost || 0;
        acc[feed.supplier].totalQuantity += feed.quantity;
      }
      return acc;
    }, {});

    return {
      period,
      totalFeedConsumed,
      totalFeedExpense,
      feedSources,
      feedSchedule,
      feedTypes,
      supplierPerformance,
    };
  }

  async getInventoryAnalytics(query: AnalyticsQueryDto) {
    const { farmId } = query;

    const inventory = await this.prisma.inventory.findFirst({
      where: { farmId },
      include: {
        goodsInStock: true,
        machinery: true,
        utilities: true,
      },
    });

    if (!inventory) {
      return {
        totalInventoryValue: 0,
        categories: {},
        facilities: [],
        equipment: [],
        goodsInStock: [],
        utilities: [],
      };
    }

    // Simplified inventory valuation
    const goodsValue = inventory.goodsInStock.length * 1000; // Estimate
    const machineryValue = inventory.machinery.length * 50000; // Estimate
    const utilitiesValue = inventory.utilities.length * 100000; // Estimate

    const totalInventoryValue = goodsValue + machineryValue + utilitiesValue;

    return {
      period: query.period,
      totalInventoryValue,
      categories: {
        goodsInStock: goodsValue,
        machinery: machineryValue,
        utilities: utilitiesValue,
      },
      facilities: inventory.utilities, // All utilities are now facilities
      equipment: inventory.machinery,
      goodsInStock: inventory.goodsInStock,
      utilities: inventory.utilities,
    };
  }

  async getSalesAnalytics(query: AnalyticsQueryDto) {
    const { farmId, period = AnalyticsPeriod.THIS_MONTH } = query;
    const { start, end } = this.getDateRange(
      period,
      query.startDate,
      query.endDate,
    );

    // Get livestock sales
    const livestockSales = await this.prisma.sale.findMany({
      where: {
        livestock: { farmId },
        saleDate: { gte: start, lte: end },
      },
      include: {
        livestock: {
          include: {
            mammal: true,
            poultry: true,
          },
        },
      },
    });

    // Get sale listings
    const saleListings = await this.prisma.saleListing.findMany({
      where: {
        farmId,
        status: 'sold',
        saleDate: { gte: start, lte: end },
      },
    });

    const totalRevenue =
      livestockSales.reduce((sum, sale) => sum + sale.saleAmount, 0) +
      saleListings.reduce((sum, listing) => sum + (listing.saleAmount || 0), 0);

    // Categorize sales
    const salesByCategory = livestockSales.reduce((acc, sale) => {
      const category = `${sale.livestock.category}_${sale.livestock.type}`;
      if (!acc[category]) {
        acc[category] = { count: 0, revenue: 0 };
      }
      acc[category].count += 1;
      acc[category].revenue += sale.saleAmount;
      return acc;
    }, {});

    // Buyer analysis
    const buyerPerformance = livestockSales.reduce((acc, sale) => {
      if (!acc[sale.buyerName]) {
        acc[sale.buyerName] = { purchases: 0, totalSpent: 0 };
      }
      acc[sale.buyerName].purchases += 1;
      acc[sale.buyerName].totalSpent += sale.saleAmount;
      return acc;
    }, {});

    return {
      period,
      totalRevenue,
      salesByCategory,
      buyerPerformance,
      livestockSales: livestockSales.length,
      averageSalePrice:
        livestockSales.length > 0 ? totalRevenue / livestockSales.length : 0,
    };
  }

  // Additional specialized analytics methods
  async getKPIMetrics(query: KPIQueryDto) {
    const {
      farmId,
      currentPeriod = AnalyticsPeriod.THIS_MONTH,
      comparisonPeriod = AnalyticsPeriod.LAST_MONTH,
    } = query;

    // Get current period data
    const currentData = await this.getBusinessOverview({
      farmId,
      period: currentPeriod,
    });

    // Get comparison period data
    const comparisonData = await this.getBusinessOverview({
      farmId,
      period: comparisonPeriod,
    });

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      totalRevenue: {
        current: currentData.revenue.total,
        previous: comparisonData.revenue.total,
        change: calculateChange(
          currentData.revenue.total,
          comparisonData.revenue.total,
        ),
        changeType:
          currentData.revenue.total >= comparisonData.revenue.total
            ? 'positive'
            : 'negative',
      },
      totalExpenses: {
        current: currentData.expenses.total,
        previous: comparisonData.expenses.total,
        change: calculateChange(
          currentData.expenses.total,
          comparisonData.expenses.total,
        ),
        changeType:
          currentData.expenses.total <= comparisonData.expenses.total
            ? 'positive'
            : 'negative',
      },
      netProfit: {
        current: currentData.profitability.netProfit,
        previous: comparisonData.profitability.netProfit,
        change: calculateChange(
          currentData.profitability.netProfit,
          comparisonData.profitability.netProfit,
        ),
        changeType:
          currentData.profitability.netProfit >=
          comparisonData.profitability.netProfit
            ? 'positive'
            : 'negative',
      },
      profitMargin: {
        current: currentData.profitability.profitMargin,
        previous: comparisonData.profitability.profitMargin,
        change: calculateChange(
          currentData.profitability.profitMargin,
          comparisonData.profitability.profitMargin,
        ),
        changeType:
          currentData.profitability.profitMargin >=
          comparisonData.profitability.profitMargin
            ? 'positive'
            : 'negative',
      },
    };
  }

  async getFinancialTrends(query: FinancialTrendsQueryDto) {
    const {
      farmId,
      metrics = ['revenue', 'expenses', 'profit'],
      granularity = 'monthly',
      periods = 12,
    } = query;

    const trends = [];
    const now = new Date();

    for (let i = periods - 1; i >= 0; i--) {
      let periodStart: Date;
      let periodEnd: Date;
      let label: string;

      if (granularity === 'monthly') {
        periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        label = periodStart.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        });
      } else if (granularity === 'quarterly') {
        const quarterStart = Math.floor((now.getMonth() - i * 3) / 3) * 3;
        periodStart = new Date(now.getFullYear(), quarterStart, 1);
        periodEnd = new Date(now.getFullYear(), quarterStart + 3, 0);
        label = `Q${Math.floor(quarterStart / 3) + 1} ${periodStart.getFullYear()}`;
      } else {
        // Default to monthly
        periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        label = periodStart.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        });
      }

      const periodData = await this.getBusinessOverview({
        farmId,
        period: AnalyticsPeriod.CUSTOM_RANGE,
        startDate: periodStart.toISOString().split('T')[0],
        endDate: periodEnd.toISOString().split('T')[0],
      });

      const trendPoint: any = { period: label };

      if (metrics.includes('revenue')) {
        trendPoint.revenue = periodData.revenue.total;
      }
      if (metrics.includes('expenses')) {
        trendPoint.expenses = periodData.expenses.total;
      }
      if (metrics.includes('profit')) {
        trendPoint.profit = periodData.profitability.netProfit;
      }

      trends.push(trendPoint);
    }

    return {
      granularity,
      periods,
      metrics,
      data: trends,
    };
  }

  async getProductionAnalytics(query: ProductionAnalyticsQueryDto) {
    const {
      farmId,
      period = AnalyticsPeriod.THIS_MONTH,
      productionType,
    } = query;
    const { start, end } = this.getDateRange(
      period,
      query.startDate,
      query.endDate,
    );

    // This would need to be enhanced with actual production tracking tables
    // For now, we'll return estimated data based on livestock

    const livestock = await this.prisma.livestock.findMany({
      where: { farmId, status: 'active' },
      include: {
        mammal: true,
        poultry: true,
      },
    });

    // Estimate production based on livestock types
    const dairyCows = livestock.filter((l) => l.type.includes('dairy')).length;
    const layers = livestock.filter((l) => l.type.includes('layer')).length;
    const broilers = livestock.filter((l) => l.type.includes('broiler')).length;

    // Estimated daily production rates
    const estimatedMilkPerDay = dairyCows * 15; // 15L per cow per day
    const estimatedEggsPerDay = layers * 0.8; // 0.8 eggs per layer per day
    const estimatedMeatPerWeek = broilers * 2.5; // 2.5kg per broiler per week

    const daysInPeriod = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const weeksInPeriod = Math.ceil(daysInPeriod / 7);

    return {
      period,
      milkProduction: {
        dailyAverage: estimatedMilkPerDay,
        totalPeriod: estimatedMilkPerDay * daysInPeriod,
        producingAnimals: dairyCows,
      },
      eggProduction: {
        dailyAverage: estimatedEggsPerDay,
        totalPeriod: estimatedEggsPerDay * daysInPeriod,
        producingAnimals: layers,
      },
      meatProduction: {
        weeklyAverage: estimatedMeatPerWeek,
        totalPeriod: estimatedMeatPerWeek * weeksInPeriod,
        producingAnimals: broilers,
      },
    };
  }

  async getDashboardSummary(query: AnalyticsQueryDto) {
    const { farmId, period = AnalyticsPeriod.THIS_MONTH } = query;

    // Get all analytics in parallel for dashboard
    const [
      businessOverview,
      livestockAnalytics,
      employeeAnalytics,
      healthAnalytics,
      kpiMetrics,
    ] = await Promise.all([
      this.getBusinessOverview(query),
      this.getLivestockAnalytics(query),
      this.getEmployeeAnalytics(query),
      this.getHealthAnalytics(query),
      this.getKPIMetrics({ farmId, currentPeriod: period }),
    ]);

    return {
      period,
      kpis: kpiMetrics,
      businessOverview,
      livestock: {
        totalAnimals: livestockAnalytics.totalAnimals,
        totalValue: livestockAnalytics.totalValue,
        healthStatus: livestockAnalytics.healthStatus,
      },
      employees: {
        totalEmployees: employeeAnalytics.totalEmployees,
        totalPayroll: employeeAnalytics.totalPayroll,
        netPay: employeeAnalytics.netPay,
      },
      health: {
        totalHealthCost:
          healthAnalytics.treatment.treatmentCost +
          healthAnalytics.vaccination.totalExpense +
          healthAnalytics.deworming.dewormingCost +
          healthAnalytics.boosters.totalExpense,
      },
    };
  }
}
