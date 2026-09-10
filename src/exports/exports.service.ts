import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type DatasetDefinition = { label: string; model: string; dateField?: string };

const DATASETS: Record<string, DatasetDefinition> = {
  users: { label: 'Users', model: 'user', dateField: 'createdAt' },
  farms: { label: 'Farms', model: 'farm', dateField: 'createdAt' },
  admins: { label: 'Admins', model: 'admin', dateField: 'createdAt' },
  billingAccounts: { label: 'Billing accounts', model: 'billingAccount', dateField: 'createdAt' },
  billingPlans: { label: 'Billing plans', model: 'billingPlan', dateField: 'createdAt' },
  billingSettings: { label: 'Billing settings', model: 'billingSetting', dateField: 'createdAt' },
  subscriptions: { label: 'Subscriptions', model: 'subscription', dateField: 'createdAt' },
  invoices: { label: 'Invoices', model: 'invoice', dateField: 'createdAt' },
  invoiceLines: { label: 'Invoice lines', model: 'invoiceLine', dateField: 'createdAt' },
  payments: { label: 'Payments', model: 'payment', dateField: 'createdAt' },
  paymentAllocations: { label: 'Payment allocations', model: 'paymentAllocation', dateField: 'createdAt' },
  billingNotifications: { label: 'Billing notifications', model: 'billingNotification', dateField: 'createdAt' },
  employees: { label: 'Employees', model: 'employee', dateField: 'createdAt' },
  employeeFarms: { label: 'Employee farm assignments', model: 'employeeFarm', dateField: 'createdAt' },
  employeeBenefits: { label: 'Employee benefits', model: 'employeeBenefit', dateField: 'createdAt' },
  livestock: { label: 'Livestock', model: 'livestock', dateField: 'createdAt' },
  mammals: { label: 'Mammals', model: 'mammal', dateField: 'createdAt' },
  poultry: { label: 'Poultry', model: 'poultry', dateField: 'createdAt' },
  mortality: { label: 'Mortality records', model: 'mortality', dateField: 'createdAt' },
  healthEvents: { label: 'Health events', model: 'healthEvent', dateField: 'createdAt' },
  transfers: { label: 'Livestock transfers', model: 'transfer', dateField: 'createdAt' },
  sales: { label: 'Sales', model: 'sale', dateField: 'createdAt' },
  breedingRecords: { label: 'Breeding records', model: 'breedingRecord', dateField: 'createdAt' },
  offspring: { label: 'Offspring', model: 'offspring', dateField: 'createdAt' },
  feedingPrograms: { label: 'Feeding programs', model: 'feedingProgram', dateField: 'createdAt' },
  feedDetails: { label: 'Feed details', model: 'feedDetails', dateField: 'createdAt' },
  inventory: { label: 'Inventory', model: 'inventory', dateField: 'createdAt' },
  goodsInStock: { label: 'Goods in stock', model: 'goodsInStock', dateField: 'createdAt' },
  machinery: { label: 'Machinery', model: 'machinery', dateField: 'createdAt' },
  utility: { label: 'Utilities', model: 'utility', dateField: 'createdAt' },
  water: { label: 'Water systems', model: 'water', dateField: 'createdAt' },
  power: { label: 'Power systems', model: 'power', dateField: 'createdAt' },
  allergyRecords: { label: 'Allergy records', model: 'allergyRecord', dateField: 'createdAt' },
  boosterRecords: { label: 'Booster records', model: 'boosterRecord', dateField: 'createdAt' },
  vaccinationRecords: { label: 'Vaccination records', model: 'vaccinationRecord', dateField: 'createdAt' },
  dewormingRecords: { label: 'Deworming records', model: 'dewormingRecord', dateField: 'createdAt' },
  geneticDisorderRecords: { label: 'Genetic disorder records', model: 'geneticDisorderRecord', dateField: 'createdAt' },
  treatmentRecords: { label: 'Treatment records', model: 'treatmentRecord', dateField: 'createdAt' },
  saleListings: { label: 'Sale listings', model: 'saleListing', dateField: 'createdAt' },
  cropCycles: { label: 'Crop cycles', model: 'cropCycle', dateField: 'createdAt' },
  labourRecords: { label: 'Labour records', model: 'labourRecord', dateField: 'createdAt' },
  crops: { label: 'Crops', model: 'crop', dateField: 'createdAt' },
  soilPrepRecords: { label: 'Soil preparation', model: 'soilPrepRecord', dateField: 'createdAt' },
  tillageRecords: { label: 'Tillage records', model: 'tillageRecord', dateField: 'createdAt' },
  plantingRecords: { label: 'Planting records', model: 'plantingRecord', dateField: 'createdAt' },
  soilDataRecords: { label: 'Soil data', model: 'soilDataRecord', dateField: 'createdAt' },
  fieldConditionRecords: { label: 'Field conditions', model: 'fieldConditionRecord', dateField: 'createdAt' },
  weatherDataRecords: { label: 'Weather data', model: 'weatherDataRecord', dateField: 'createdAt' },
  fertilizerRecords: { label: 'Fertilizer records', model: 'fertilizerRecord', dateField: 'createdAt' },
  irrigationRecords: { label: 'Irrigation records', model: 'irrigationRecord', dateField: 'createdAt' },
  weedingRecords: { label: 'Weeding records', model: 'weedingRecord', dateField: 'createdAt' },
  chemicalRecords: { label: 'Chemical records', model: 'chemicalRecord', dateField: 'createdAt' },
  diseaseRecords: { label: 'Disease records', model: 'diseaseRecord', dateField: 'createdAt' },
  pestRecords: { label: 'Pest records', model: 'pestRecord', dateField: 'createdAt' },
  pesticideRecords: { label: 'Pesticide records', model: 'pesticideRecord', dateField: 'createdAt' },
  harvestingRecords: { label: 'Harvesting records', model: 'harvestingRecord', dateField: 'createdAt' },
  processingRecords: { label: 'Processing records', model: 'processingRecord', dateField: 'createdAt' },
  lossRecords: { label: 'Loss records', model: 'lossRecord', dateField: 'createdAt' },
  cropSaleRecords: { label: 'Crop sales', model: 'cropSaleRecord', dateField: 'createdAt' },
  cropAlerts: { label: 'Crop alerts', model: 'cropAlert', dateField: 'createdAt' },
};

const SENSITIVE = new Set(['pin', 'password', 'otp', 'otpExpiry', 'accessToken', 'refreshToken', 'secret']);

function safeValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'bigint') return value.toString();
  if (Array.isArray(value)) return value.map(safeValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !SENSITIVE.has(key))
      .map(([key, nested]) => [key, safeValue(nested)]));
  }
  return value;
}

@Injectable()
export class ExportsService {
  constructor(private readonly prisma: PrismaService) {}

  catalog() {
    return Object.entries(DATASETS).map(([key, value]) => ({ key, label: value.label }));
  }

  async findAll(dataset: string, page = 1, limit = 100, from?: string, to?: string) {
    const definition = DATASETS[dataset];
    if (!definition) throw new NotFoundException(`Unknown export dataset: ${dataset}`);
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 1000);
    const where: Record<string, unknown> = {};
    if (definition.dateField && (from || to)) {
      const range: Record<string, Date> = {};
      if (from) range.gte = new Date(from);
      if (to) { const end = new Date(to); end.setUTCHours(23, 59, 59, 999); range.lte = end; }
      where[definition.dateField] = range;
    }
    const delegate = (this.prisma as any)[definition.model];
    const [rows, total] = await Promise.all([
      delegate.findMany({ skip: (safePage - 1) * safeLimit, take: safeLimit, where, orderBy: { [definition.dateField ?? 'id']: 'desc' } }),
      delegate.count({ where }),
    ]);
    const pages = Math.ceil(total / safeLimit);
    return { data: rows.map(safeValue), meta: { total, page: safePage, pages, hasNextPage: safePage < pages, hasPrevPage: safePage > 1 } };
  }
}
