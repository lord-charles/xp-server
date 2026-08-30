import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { randomInt } from 'crypto';
import { Prisma } from '../../prisma/generated/prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateOrUpdatePlanDto,
  CreateAdminInvoiceDto,
  InitiateStkPushDto,
  RecordMpesaPaymentDto,
  RecordManualPaymentDto,
  UpdateSubscriptionDto,
} from './dto/billing.dto';

const INITIAL_SETTINGS = [
  ['TRIAL_DAYS', '30', 'Days of free access after account setup.'],
  ['REMINDER_DAYS', '7', 'Days before an invoice due date to send a reminder.'],
  ['GRACE_DAYS', '30', 'Days after due date before suspension.'],
  ['SUSPENSION_TERMINATION_DAYS', '90', 'Days suspended before termination.'],
  [
    'PRICING_COMBINATION_STRATEGY',
    'SUM',
    'SUM | HIGHEST | LIVESTOCK_ONLY | CROPS_ONLY.',
  ],
  [
    'BILLING_TIMEZONE',
    'Africa/Nairobi',
    'Operational timezone for billing communications.',
  ],
];

const INITIAL_PLANS = [
  ['LIVESTOCK_STARTER', 'Livestock Starter', 'LIVESTOCK_COUNT', 1, 100, 100],
  ['LIVESTOCK_SMALL', 'Livestock Small', 'LIVESTOCK_COUNT', 101, 150, 500],
  ['LIVESTOCK_MEDIUM', 'Livestock Medium', 'LIVESTOCK_COUNT', 151, 200, 1000],
  ['LIVESTOCK_LARGE', 'Livestock Large', 'LIVESTOCK_COUNT', 201, 500, 2000],
  [
    'LIVESTOCK_ENTERPRISE',
    'Livestock Enterprise',
    'LIVESTOCK_COUNT',
    501,
    1000,
    5000,
  ],
  [
    'LIVESTOCK_ENTERPRISE_PLUS',
    'Livestock Enterprise +',
    'LIVESTOCK_COUNT',
    1001,
    null,
    10000,
  ],
  ['POULTRY_FLAT', 'Poultry', 'POULTRY_FLAT', null, null, 750],
  ['CROPS_STARTER', 'Crops Starter', 'CROPS_ACRES', 1, 3, 100],
  ['CROPS_SMALL', 'Crops Small', 'CROPS_ACRES', 4, 10, 500],
  ['CROPS_MEDIUM', 'Crops Medium', 'CROPS_ACRES', 11, 30, 1000],
  ['CROPS_LARGE', 'Crops Large', 'CROPS_ACRES', 31, 50, 2000],
  ['CROPS_ENTERPRISE', 'Crops Enterprise', 'CROPS_ACRES', 51, 200, 5000],
  [
    'CROPS_ENTERPRISE_PLUS',
    'Crops Enterprise +',
    'CROPS_ACRES',
    201,
    null,
    10000,
  ],
] as const;

@Injectable()
export class BillingService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
  ) {}

  async onModuleInit() {
    // Seed only missing records. Existing admin configuration is never overwritten.
    await this.prisma.billingSetting.createMany({
      data: INITIAL_SETTINGS.map(([key, value, description]) => ({
        key,
        value,
        description,
        isSystemSeed: true,
      })),
      skipDuplicates: true,
    });
    await this.prisma.billingPlan.createMany({
      data: INITIAL_PLANS.map(
        ([code, name, metric, minValue, maxValue, monthlyAmount]) => ({
          code,
          name,
          metric,
          minValue,
          maxValue,
          monthlyAmount: new Prisma.Decimal(monthlyAmount),
          isSystemSeed: true,
        }),
      ),
      skipDuplicates: true,
    });
  }

  async createAccountForUser(userId: string, farmId: string) {
    const existing = await this.prisma.billingAccount.findUnique({
      where: { userId },
    });
    if (existing) return existing;
    const accountNumber = await this.nextAccountNumber();
    const trialDays = await this.settingNumber('TRIAL_DAYS', 30);
    const startedAt = new Date();
    const trialEndsAt = this.addDays(startedAt, trialDays);
    const { account, subscription } = await this.prisma.$transaction(
      async (tx) => {
        const account = await tx.billingAccount.create({
          data: { userId, accountNumber },
        });
        const subscription = await tx.subscription.create({
          data: {
            billingAccountId: account.id,
            farmId,
            startedAt,
            trialEndsAt,
          },
        });
        return { account, subscription };
      },
    );
    await this.ensureInitialInvoice(subscription);
    return account;
  }

  async backfillAccounts() {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null, billingAccount: null },
      select: {
        id: true,
        farms: { orderBy: { createdAt: 'asc' }, select: { id: true } },
      },
    });
    let created = 0;
    for (const user of users) {
      for (const farm of user.farms) {
        const account = await this.prisma.billingAccount.findUnique({
          where: { userId: user.id },
        });
        if (!account) {
          await this.createAccountForUser(user.id, farm.id);
          created++;
        } else {
          await this.ensureSubscription(account.id, farm.id);
        }
      }
    }
    return { scannedUsers: users.length, createdAccounts: created };
  }

  async provisionCustomer(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, farms: { orderBy: { createdAt: 'asc' } } },
    });
    if (!user) throw new NotFoundException('Customer not found');
    if (!user.farms.length)
      throw new BadRequestException(
        'A billing account requires at least one farm.',
      );

    const account = await this.createAccountForUser(user.id, user.farms[0].id);
    for (const farm of user.farms) {
      await this.ensureSubscription(account.id, farm.id);
    }
    return this.getCustomerDetails(userId);
  }

  async createAdminInvoice(userId: string, dto: CreateAdminInvoiceDto) {
    const [subscription, plan] = await Promise.all([
      this.prisma.subscription.findFirst({
        where: { id: dto.subscriptionId, billingAccount: { userId } },
        include: { billingAccount: true },
      }),
      this.prisma.billingPlan.findFirst({
        where: { id: dto.planId, isActive: true },
      }),
    ]);
    if (!subscription) throw new NotFoundException('Subscription not found');
    if (!plan) throw new NotFoundException('Active billing plan not found');

    const now = new Date();
    const periodStartAt = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const periodEndAt = this.addMonths(
      periodStartAt,
      subscription.billingCycle === 'ANNUAL' ? 12 : 1,
    );
    const amount = new Prisma.Decimal(plan.monthlyAmount).mul(
      subscription.billingCycle === 'ANNUAL' ? 12 : 1,
    );
    const existingInvoices = await this.prisma.invoice.findMany({
      where: {
        subscriptionId: subscription.id,
        status: { in: ['OPEN', 'UNPRICED', 'OVERDUE', 'PARTIALLY_PAID'] },
      },
      include: { allocations: { select: { id: true } } },
    });
    const currentInvoice = await this.prisma.invoice.findFirst({
      where: { subscriptionId: subscription.id, periodStartAt, periodEndAt },
      include: { allocations: { select: { id: true } } },
    });
    if (existingInvoices.some((invoice) => invoice.allocations.length)) {
      throw new BadRequestException(
        'A price override cannot replace an invoice with recorded payments.',
      );
    }
    if (
      currentInvoice?.allocations.length ||
      currentInvoice?.status === 'PAID'
    ) {
      throw new BadRequestException(
        'A price override cannot replace an invoice with recorded payments.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.invoice.updateMany({
        where: {
          AND: [
            { id: { in: existingInvoices.map((invoice) => invoice.id) } },
            ...(currentInvoice ? [{ id: { not: currentInvoice.id } }] : []),
          ],
        },
        data: { status: 'VOID' },
      });
      const invoiceData = {
        status: 'OPEN',
        currency: plan.currency,
        issuedAt: now,
        dueAt: now,
        periodStartAt,
        periodEndAt,
        totalAmount: amount,
        amountPaid: new Prisma.Decimal(0),
        balanceDue: amount,
        billingSnapshot: {
          source: 'ADMIN_PLAN_OVERRIDE',
          planId: plan.id,
          planCode: plan.code,
          billingCycle: subscription.billingCycle,
          generatedAt: now.toISOString(),
        },
        lines: {
          create: {
            billingPlanId: plan.id,
            description: `Admin-selected plan: ${plan.name}`,
            unitAmount: amount,
            lineAmount: amount,
            pricingSnapshot: {
              code: plan.code,
              metric: plan.metric,
              monthlyAmount: plan.monthlyAmount.toString(),
              source: 'ADMIN_PLAN_OVERRIDE',
              billingCycle: subscription.billingCycle,
            },
          },
        },
      };
      if (currentInvoice) {
        return tx.invoice.update({
          where: { id: currentInvoice.id },
          data: {
            ...invoiceData,
            lines: { deleteMany: {}, create: invoiceData.lines.create },
          },
        });
      }
      return tx.invoice.create({
        data: {
          ...invoiceData,
          invoiceNumber: await this.nextInvoiceNumber(tx),
          billingAccountId: subscription.billingAccountId,
          subscriptionId: subscription.id,
        },
      });
    });
  }

  async overrideInvoicePlan(invoiceId: string, planId: string) {
    const [invoice, plan] = await Promise.all([
      this.prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { subscription: true, allocations: { select: { id: true } } },
      }),
      this.prisma.billingPlan.findFirst({
        where: { id: planId, isActive: true },
      }),
    ]);
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (!plan) throw new NotFoundException('Active billing plan not found');
    if (invoice.allocations.length || invoice.status === 'PAID') {
      throw new BadRequestException(
        'A plan cannot override an invoice with recorded payments.',
      );
    }
    const amount = new Prisma.Decimal(plan.monthlyAmount).mul(
      invoice.subscription.billingCycle === 'ANNUAL' ? 12 : 1,
    );
    return this.prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: 'OPEN',
        currency: plan.currency,
        totalAmount: amount,
        amountPaid: new Prisma.Decimal(0),
        balanceDue: amount,
        billingSnapshot: {
          source: 'ADMIN_INVOICE_OVERRIDE',
          planId: plan.id,
          planCode: plan.code,
          billingCycle: invoice.subscription.billingCycle,
          overriddenAt: new Date().toISOString(),
        },
        lines: {
          deleteMany: {},
          create: {
            billingPlanId: plan.id,
            description: `Admin-selected plan: ${plan.name}`,
            unitAmount: amount,
            lineAmount: amount,
            pricingSnapshot: {
              code: plan.code,
              metric: plan.metric,
              monthlyAmount: plan.monthlyAmount.toString(),
              source: 'ADMIN_INVOICE_OVERRIDE',
              billingCycle: invoice.subscription.billingCycle,
            },
          },
        },
      },
    });
  }

  async ensureSubscription(billingAccountId: string, farmId: string) {
    const exists = await this.prisma.subscription.findUnique({
      where: { farmId },
    });
    if (exists) {
      await this.ensureInitialInvoice(exists);
      return exists;
    }
    const trialDays = await this.settingNumber('TRIAL_DAYS', 30);
    const startedAt = new Date();
    const trialEndsAt = this.addDays(startedAt, trialDays);
    const subscription = await this.prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.create({
        data: { billingAccountId, farmId, startedAt, trialEndsAt },
      });
      return subscription;
    });
    await this.ensureInitialInvoice(subscription);
    return subscription;
  }

  async getMyBilling(userId: string) {
    const account = await this.prisma.billingAccount.findUnique({
      where: { userId },
      include: {
        subscriptions: {
          include: { farm: true },
          orderBy: { createdAt: 'asc' },
        },
        invoices: { orderBy: { dueAt: 'desc' }, take: 10 },
      },
    });
    if (!account) throw new NotFoundException('Billing account not found');
    return account;
  }

  async getCustomerDetails(userId: string) {
    const account = await this.prisma.billingAccount.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            gender: true,
            dob: true,
            residenceCounty: true,
            residenceLocation: true,
            constituency: true,
            residenceConstituency: true,
            email: true,
            phoneNumber: true,
            nationalId: true,
            businessNumber: true,
            yearsOfExperience: true,
            isVerified: true,
            createdAt: true,
            farms: { include: { livestock: { include: { poultry: true } } } },
          },
        },
        subscriptions: {
          include: { farm: true },
          orderBy: { createdAt: 'asc' },
        },
        invoices: {
          include: {
            subscription: true,
            lines: { include: { billingPlan: true } },
            allocations: { include: { payment: true } },
          },
          orderBy: { dueAt: 'desc' },
        },
      },
    });

    if (!account) {
      const user = await this.prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          gender: true,
          dob: true,
          residenceCounty: true,
          residenceLocation: true,
          constituency: true,
          residenceConstituency: true,
          email: true,
          phoneNumber: true,
          nationalId: true,
          businessNumber: true,
          yearsOfExperience: true,
          isVerified: true,
          createdAt: true,
          farms: true,
        },
      });
      if (!user) throw new NotFoundException('Customer not found');
      return {
        billingAccount: null,
        customer: user,
        subscriptions: [],
        invoices: [],
      };
    }

    const now = new Date();
    return {
      billingAccount: {
        id: account.id,
        accountNumber: account.accountNumber,
        status: account.status,
        createdAt: account.createdAt,
      },
      customer: account.user,
      subscriptions: account.subscriptions.map((subscription) => ({
        id: subscription.id,
        farmId: subscription.farmId,
        farmName: subscription.farm.name,
        billingCycle: subscription.billingCycle,
        status: this.accessStatus(subscription, now),
        startedAt: subscription.startedAt,
        trialEndsAt: subscription.trialEndsAt,
        currentPeriodStartAt: subscription.currentPeriodStartAt,
        currentPeriodEndAt: subscription.currentPeriodEndAt,
        graceEndsAt: subscription.graceEndsAt,
        suspendedAt: subscription.suspendedAt,
      })),
      invoices: account.invoices.map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        subscriptionId: invoice.subscriptionId,
        status: invoice.status,
        issuedAt: invoice.issuedAt,
        dueAt: invoice.dueAt,
        totalAmount: Number(invoice.totalAmount),
        amountPaid: Number(invoice.amountPaid),
        balanceDue: Number(invoice.balanceDue),
        billingCycle: invoice.subscription.billingCycle,
        lines: invoice.lines.map((line) => ({
          description: line.description,
          amount: Number(line.lineAmount),
          planName: line.billingPlan?.name || null,
        })),
        payments: invoice.allocations.map(({ payment }) => ({
          id: payment.id,
          provider: payment.provider,
          status: payment.status,
          amount: Number(payment.amount),
          receiptNumber: payment.mpesaReceiptNumber,
          createdAt: payment.createdAt,
        })),
      })),
    };
  }

  async getAccess(user: { id: string; userType: string }) {
    if (user.userType === 'admin') return { allowed: true, status: 'ADMIN' };
    const account = await this.prisma.billingAccount.findUnique({
      where: { userId: user.id },
      include: { subscriptions: true },
    });
    if (!account) return { allowed: true, status: 'UNBILLED' }; // Existing users remain available until backfill is run.
    const now = new Date();
    const statuses = account.subscriptions.map((subscription) =>
      this.accessStatus(subscription, now),
    );
    return {
      allowed: statuses.some(
        (status) =>
          status === 'TRIAL' || status === 'ACTIVE' || status === 'GRACE',
      ),
      status: statuses.includes('SUSPENDED')
        ? 'SUSPENDED'
        : statuses.includes('TERMINATED')
          ? 'TERMINATED'
          : statuses[0] || 'ACTIVE',
      accountNumber: account.accountNumber,
    };
  }

  async getEmployeeAccess(employeeId: string) {
    const farms = await this.prisma.employeeFarm.findMany({
      where: { employeeId },
      select: { farm: { select: { userId: true } } },
      distinct: ['farmId'],
    });
    const ownerAccess = await Promise.all(
      farms.map(({ farm }) =>
        this.getAccess({ id: farm.userId, userType: 'user' }),
      ),
    );
    return {
      allowed: ownerAccess.some((item) => item.allowed),
      status: ownerAccess.find((item) => !item.allowed)?.status || 'ACTIVE',
    };
  }

  async listPlans() {
    return this.prisma.billingPlan.findMany({
      orderBy: [{ metric: 'asc' }, { minValue: 'asc' }],
    });
  }
  async listSettings() {
    return this.prisma.billingSetting.findMany({ orderBy: { key: 'asc' } });
  }
  async updateSetting(key: string, value: string) {
    return this.prisma.billingSetting.update({
      where: { key },
      data: { value },
    });
  }
  async savePlan(dto: CreateOrUpdatePlanDto) {
    return this.prisma.billingPlan.upsert({
      where: { code: dto.code },
      create: { ...dto, monthlyAmount: new Prisma.Decimal(dto.monthlyAmount) },
      update: {
        name: dto.name,
        metric: dto.metric,
        minValue: dto.minValue ?? null,
        maxValue: dto.maxValue ?? null,
        monthlyAmount: new Prisma.Decimal(dto.monthlyAmount),
        isActive: dto.isActive ?? true,
      },
    });
  }
  async updateSubscription(id: string, dto: UpdateSubscriptionDto) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      select: { billingAccount: { select: { userId: true } } },
    });
    if (!subscription) throw new NotFoundException('Subscription not found');
    return this.selectBillingCycle(subscription.billingAccount.userId, id, dto);
  }

  async selectBillingCycle(
    userId: string,
    subscriptionId: string,
    dto: UpdateSubscriptionDto,
  ) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { id: subscriptionId, billingAccount: { userId } },
      include: { invoices: { include: { allocations: true } } },
    });
    if (!subscription) throw new NotFoundException('Subscription not found');
    if (
      subscription.invoices.some(
        (invoice) =>
          invoice.allocations.length > 0 || invoice.status === 'PAID',
      )
    )
      throw new BadRequestException(
        'Billing cycle cannot be changed after a payment has been allocated',
      );
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.invoice.deleteMany({
        where: {
          subscriptionId,
          status: { in: ['OPEN', 'UNPRICED', 'OVERDUE', 'PARTIALLY_PAID'] },
        },
      });
      const updated = await tx.subscription.update({
        where: { id: subscriptionId },
        data: { billingCycle: dto.billingCycle },
      });
      return updated;
    });
    await this.ensureInitialInvoice(updated);
    return updated;
  }

  async listCustomers(page = 1, limit = 20, search?: string, status?: string) {
    const where: any = { user: { deletedAt: null } };
    if (search)
      where.OR = [
        { accountNumber: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    const [total, accounts] = await this.prisma.$transaction([
      this.prisma.billingAccount.count({ where }),
      this.prisma.billingAccount.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            include: {
              farms: { include: { livestock: { include: { poultry: true } } } },
            },
          },
          subscriptions: true,
        },
      }),
    ]);
    const now = new Date();
    const data = accounts
      .map((account) => {
        const farm = account.user.farms[0];
        const accountStatus = account.subscriptions
          .map((subscription) => this.accessStatus(subscription, now))
          .includes('SUSPENDED')
          ? 'Suspended'
          : account.subscriptions.some(
                (subscription) =>
                  this.accessStatus(subscription, now) === 'GRACE',
              )
            ? 'Overdue'
            : 'Active';
        return {
          id: account.user.id,
          accountId: account.accountNumber,
          registrationDate: account.createdAt,
          name: `${account.user.firstName} ${account.user.lastName}`,
          mobileNumber: account.user.phoneNumber,
          additionalContact: account.user.businessNumber,
          email: account.user.email,
          nationalId: account.user.nationalId,
          gender: account.user.gender,
          dateOfBirth: account.user.dob,
          residentialAddress: {
            county: account.user.residenceCounty,
            constituency: account.user.constituency,
            ward: account.user.residenceLocation,
          },
          farmBusinessName: farm?.name,
          farmLocation: {
            county: farm?.county,
            constituency: farm?.administrativeLocation,
            ward: '',
          },
          farmSize: farm?.size || 0,
          ownership: farm?.ownership,
          typeOfFarming: farm?.farmingTypes.join(', ') || '',
          numberOfLivestock: account.user.farms
            .flatMap((item) => item.livestock)
            .reduce(
              (sum, item) =>
                sum +
                (item.category === 'poultry'
                  ? item.poultry?.currentQuantity || 0
                  : 1),
              0,
            ),
          numberOfEmployees: 0,
          numberOfFarms: account.user.farms.length,
          yearsOfExperience: account.user.yearsOfExperience,
          accountStatus,
          billingCycle:
            account.subscriptions[0]?.billingCycle === 'ANNUAL'
              ? 'Annual Payment'
              : 'Monthly Payment',
          createdAt: account.createdAt,
          updatedAt: account.updatedAt,
        };
      })
      .filter(
        (item) =>
          !status || item.accountStatus.toLowerCase() === status.toLowerCase(),
      );
    return {
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      success: true,
    };
  }

  async listInvoices(
    page = 1,
    limit = 20,
    status?: string,
    customerId?: string,
  ) {
    const where: any = {};
    if (status) where.status = status.toUpperCase().replace(' ', '_');
    if (customerId) where.billingAccount = { userId: customerId };
    const [total, invoices] = await this.prisma.$transaction([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { dueAt: 'desc' },
        include: {
          billingAccount: { include: { user: true } },
          subscription: true,
          allocations: { include: { payment: true } },
        },
      }),
    ]);
    return {
      data: invoices.map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        clientName: `${invoice.billingAccount.user.firstName} ${invoice.billingAccount.user.lastName}`,
        accountId: invoice.billingAccount.accountNumber,
        customerId: invoice.billingAccount.userId,
        invoiceDate: invoice.issuedAt,
        dueDate: invoice.dueAt,
        paymentMethod: 'M-Pesa',
        invoiceAmount: Number(invoice.totalAmount),
        amountPaid: Number(invoice.amountPaid),
        outstandingBalance: Number(invoice.balanceDue),
        status:
          invoice.status === 'PARTIALLY_PAID'
            ? 'Partially Paid'
            : invoice.status[0] + invoice.status.slice(1).toLowerCase(),
        transactionId:
          invoice.allocations[0]?.payment.mpesaReceiptNumber ||
          invoice.allocations[0]?.payment.providerTransaction,
        billingCycle:
          invoice.subscription.billingCycle === 'ANNUAL'
            ? 'Annual Payment'
            : 'Monthly Payment',
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      success: true,
    };
  }

  async billingStats() {
    const [accounts, invoices, payments] = await Promise.all([
      this.prisma.billingAccount.findMany({ include: { subscriptions: true } }),
      this.prisma.invoice.findMany(),
      this.prisma.payment.findMany({ where: { status: 'SUCCESS' } }),
    ]);
    const now = new Date();
    const activeCustomers = accounts.filter((account) =>
      account.subscriptions.some((subscription) =>
        ['TRIAL', 'ACTIVE', 'GRACE'].includes(
          this.accessStatus(subscription, now),
        ),
      ),
    ).length;
    const suspendedCustomers = accounts.filter((account) =>
      account.subscriptions.some(
        (subscription) => this.accessStatus(subscription, now) === 'SUSPENDED',
      ),
    ).length;
    const overdueCustomers = accounts.filter((account) =>
      account.subscriptions.some(
        (subscription) => this.accessStatus(subscription, now) === 'GRACE',
      ),
    ).length;
    return {
      data: {
        totalCustomers: accounts.length,
        activeCustomers,
        suspendedCustomers,
        overdueCustomers,
        totalInvoices: invoices.length,
        pendingInvoices: invoices.filter((invoice) =>
          ['OPEN', 'PARTIALLY_PAID', 'OVERDUE'].includes(invoice.status),
        ).length,
        paidInvoices: invoices.filter((invoice) => invoice.status === 'PAID')
          .length,
        totalRevenue: payments.reduce(
          (sum, payment) => sum + Number(payment.amount),
          0,
        ),
        outstandingAmount: invoices.reduce(
          (sum, invoice) => sum + Number(invoice.balanceDue),
          0,
        ),
        monthlyRevenue: payments
          .filter(
            (payment) =>
              payment.completedAt &&
              payment.completedAt.getUTCMonth() === now.getUTCMonth() &&
              payment.completedAt.getUTCFullYear() === now.getUTCFullYear(),
          )
          .reduce((sum, payment) => sum + Number(payment.amount), 0),
      },
      success: true,
    };
  }

  async registerC2bUrls() {
    const token = await this.mpesaToken();
    const callbackBase = this.requiredConfig('MPESA_CALLBACK_BASE_URL').replace(
      /\/$/,
      '',
    );
    const response = await axios.post(
      `${this.mpesaBaseUrl()}/mpesa/c2b/v1/registerurl`,
      {
        ShortCode:
          this.config.get('MPESA_C2B_SHORTCODE') ||
          this.requiredConfig('MPESA_SHORTCODE'),
        ResponseType: this.config.get('MPESA_C2B_RESPONSE_TYPE') || 'Completed',
        ConfirmationURL: `${callbackBase}/billing/c2b/confirmation`,
        ValidationURL: `${callbackBase}/billing/c2b/validation`,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  }

  async initiateStkPush(userId: string, dto: InitiateStkPushDto) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: dto.invoiceId, billingAccount: { userId } },
      include: { billingAccount: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (
      invoice.status === 'PAID' ||
      new Prisma.Decimal(invoice.balanceDue).lte(0)
    )
      throw new BadRequestException('Invoice is already paid');
    const phone = this.normalisePhone(dto.phoneNumber);
    const amount = Math.ceil(Number(invoice.balanceDue));
    const payment = await this.prisma.payment.create({
      data: {
        billingAccountId: invoice.billingAccountId,
        provider: 'MPESA_STK',
        amount,
        payerPhone: phone,
        accountReference: invoice.billingAccount.accountNumber,
      },
    });
    try {
      const timestamp = this.mpesaTimestamp();
      const shortcode = this.requiredConfig('MPESA_SHORTCODE');
      const passkey = this.requiredConfig('MPESA_PASSKEY');
      const callbackBase = this.requiredConfig(
        'MPESA_CALLBACK_BASE_URL',
      ).replace(/\/$/, '');
      const token = await this.mpesaToken();
      const response = await axios.post(
        `${this.mpesaBaseUrl()}/mpesa/stkpush/v1/processrequest`,
        {
          BusinessShortCode: shortcode,
          Password: Buffer.from(`${shortcode}${passkey}${timestamp}`).toString(
            'base64',
          ),
          Timestamp: timestamp,
          TransactionType:
            this.config.get('MPESA_TRANSACTION_TYPE') ||
            'CustomerPayBillOnline',
          Amount: amount,
          PartyA: phone,
          PartyB: shortcode,
          PhoneNumber: phone,
          CallBackURL: `${callbackBase}/billing/stk/callback`,
          AccountReference: invoice.billingAccount.accountNumber,
          TransactionDesc: `XpertFarmer ${invoice.invoiceNumber}`.slice(0, 13),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = response.data;
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          merchantRequestId: data.MerchantRequestID,
          checkoutRequestId: data.CheckoutRequestID,
          providerPayload: data,
        },
      });
      return {
        paymentId: payment.id,
        checkoutRequestId: data.CheckoutRequestID,
        customerMessage: data.CustomerMessage,
      };
    } catch (error) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED', failureReason: this.errorMessage(error) },
      });
      throw new BadRequestException(
        'Unable to initiate M-Pesa prompt. Please try again.',
      );
    }
  }

  async initiateAdminStkPush(invoiceId: string, phoneNumber: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { billingAccount: { select: { userId: true } } },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return this.initiateStkPush(invoice.billingAccount.userId, {
      invoiceId,
      phoneNumber,
    });
  }

  async handleStkCallback(payload: any) {
    const callback = payload?.Body?.stkCallback;
    if (!callback?.CheckoutRequestID)
      throw new BadRequestException('Invalid STK callback');
    const payment = await this.prisma.payment.findUnique({
      where: { checkoutRequestId: callback.CheckoutRequestID },
    });
    if (!payment || payment.status === 'SUCCESS')
      return { ResultCode: 0, ResultDesc: 'Accepted' };
    if (callback.ResultCode !== 0) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          failureReason: callback.ResultDesc || 'M-Pesa payment failed',
          providerPayload: payload,
        },
      });
      return { ResultCode: 0, ResultDesc: 'Accepted' };
    }
    const fields = Object.fromEntries(
      (callback.CallbackMetadata?.Item || []).map((item) => [
        item.Name,
        item.Value,
      ]),
    );
    await this.settlePayment(
      payment.id,
      new Prisma.Decimal(fields.Amount || payment.amount),
      String(fields.MpesaReceiptNumber),
      payload,
      String(fields.PhoneNumber || payment.payerPhone || ''),
    );
    return { ResultCode: 0, ResultDesc: 'Accepted' };
  }

  async validateC2b(payload: any) {
    const accountReference = String(payload?.BillRefNumber || '').trim();
    const account = await this.prisma.billingAccount.findUnique({
      where: { accountNumber: accountReference },
    });
    return account
      ? { ResultCode: 0, ResultDesc: 'Accepted' }
      : { ResultCode: 1, ResultDesc: 'Unknown account number' };
  }

  async confirmC2b(payload: any) {
    const receipt = String(payload?.TransID || '');
    const account = await this.prisma.billingAccount.findUnique({
      where: { accountNumber: String(payload?.BillRefNumber || '').trim() },
    });
    if (!account || !receipt) return { ResultCode: 0, ResultDesc: 'Accepted' };
    const duplicate = await this.prisma.payment.findFirst({
      where: {
        OR: [{ mpesaReceiptNumber: receipt }, { providerTransaction: receipt }],
      },
    });
    if (duplicate) return { ResultCode: 0, ResultDesc: 'Accepted' };
    const payment = await this.prisma.payment.create({
      data: {
        billingAccountId: account.id,
        provider: 'MPESA_C2B',
        amount: new Prisma.Decimal(payload.TransAmount),
        payerPhone: String(payload.MSISDN || ''),
        accountReference: account.accountNumber,
        providerTransaction: receipt,
        providerPayload: payload,
      },
    });
    await this.settlePayment(
      payment.id,
      new Prisma.Decimal(payload.TransAmount),
      receipt,
      payload,
      String(payload.MSISDN || ''),
    );
    return { ResultCode: 0, ResultDesc: 'Accepted' };
  }

  async recordManualPayment(invoiceId: string, dto: RecordManualPaymentDto) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    const payment = await this.prisma.payment.create({
      data: {
        billingAccountId: invoice.billingAccountId,
        provider: dto.provider,
        amount: new Prisma.Decimal(dto.amount),
        providerTransaction: dto.reference,
      },
    });
    await this.settlePayment(
      payment.id,
      new Prisma.Decimal(dto.amount),
      dto.reference || payment.id,
      { recordedManually: true },
      undefined,
      invoiceId,
    );
    return this.prisma.payment.findUnique({ where: { id: payment.id } });
  }

  async recordMpesaPayment(invoiceId: string, dto: RecordMpesaPaymentDto) {
    const receipt = dto.receiptNumber.trim().toUpperCase();
    if (!receipt)
      throw new BadRequestException('An M-Pesa receipt code is required');
    const [invoice, duplicate] = await Promise.all([
      this.prisma.invoice.findUnique({ where: { id: invoiceId } }),
      this.prisma.payment.findFirst({
        where: {
          OR: [
            { mpesaReceiptNumber: receipt },
            { providerTransaction: receipt },
          ],
        },
      }),
    ]);
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (duplicate)
      throw new BadRequestException(
        'This M-Pesa receipt has already been recorded',
      );
    if (
      invoice.status === 'PAID' ||
      new Prisma.Decimal(invoice.balanceDue).lte(0)
    )
      throw new BadRequestException('Invoice is already paid');
    if (new Prisma.Decimal(dto.amount).gt(invoice.balanceDue))
      throw new BadRequestException(
        'Payment amount cannot exceed this invoice balance.',
      );
    const payment = await this.prisma.payment.create({
      data: {
        billingAccountId: invoice.billingAccountId,
        provider: 'MPESA_MANUAL',
        amount: new Prisma.Decimal(dto.amount),
        payerPhone: dto.phoneNumber
          ? this.normalisePhone(dto.phoneNumber)
          : undefined,
        providerTransaction: receipt,
      },
    });
    await this.settlePayment(
      payment.id,
      new Prisma.Decimal(dto.amount),
      receipt,
      { recordedByAdmin: true, receipt },
      dto.phoneNumber ? this.normalisePhone(dto.phoneNumber) : undefined,
      invoiceId,
    );
    return this.prisma.payment.findUnique({ where: { id: payment.id } });
  }

  async processLifecycle() {
    const now = new Date();
    const [reminderDays, graceDays, terminationDays] = await Promise.all([
      this.settingNumber('REMINDER_DAYS', 7),
      this.settingNumber('GRACE_DAYS', 30),
      this.settingNumber('SUSPENSION_TERMINATION_DAYS', 90),
    ]);
    const subscriptions = await this.prisma.subscription.findMany({
      include: {
        invoices: {
          where: {
            status: { in: ['OPEN', 'PARTIALLY_PAID', 'OVERDUE', 'UNPRICED'] },
          },
          orderBy: { dueAt: 'asc' },
        },
        billingAccount: { include: { user: true } },
      },
    });
    for (const subscription of subscriptions) {
      const openInvoice = subscription.invoices[0];
      if (subscription.status === 'TRIAL' && now >= subscription.trialEndsAt)
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'GRACE',
            graceEndsAt: this.addDays(subscription.trialEndsAt, graceDays),
          },
        });
      if (
        subscription.status === 'ACTIVE' &&
        subscription.currentPeriodEndAt &&
        now >= this.addDays(subscription.currentPeriodEndAt, -reminderDays)
      ) {
        const nextStart = subscription.currentPeriodEndAt;
        const nextEnd = this.addMonths(
          nextStart,
          subscription.billingCycle === 'ANNUAL' ? 12 : 1,
        );
        const existingNextInvoice = await this.prisma.invoice.findFirst({
          where: {
            subscriptionId: subscription.id,
            periodStartAt: nextStart,
            periodEndAt: nextEnd,
          },
        });
        if (!existingNextInvoice)
          await this.createInvoiceForSubscription(
            subscription.id,
            now,
            nextStart,
          );
      }
      if (!openInvoice) continue;
      // A setup may precede livestock entry. Keep the required day-one invoice,
      // but automatically price it once measurable farm data becomes available.
      if (openInvoice.status === 'UNPRICED') {
        await this.repriceInvoice(openInvoice.id);
        continue;
      }
      const dueSoon =
        this.addDays(now, reminderDays) >= openInvoice.dueAt &&
        now < openInvoice.dueAt;
      if (dueSoon)
        await this.sendInvoiceNotification(
          openInvoice.id,
          'DUE_REMINDER',
          `XpertFarmer: ${openInvoice.invoiceNumber} of KES ${openInvoice.balanceDue} is due on ${openInvoice.dueAt.toLocaleDateString('en-KE')}. Pay via M-Pesa using account ${subscription.billingAccount.accountNumber}.`,
        );
      if (now >= openInvoice.dueAt && openInvoice.status !== 'OVERDUE') {
        await this.prisma.invoice.update({
          where: { id: openInvoice.id },
          data: { status: 'OVERDUE' },
        });
        await this.sendInvoiceNotification(
          openInvoice.id,
          'DUE_DATE',
          `XpertFarmer: your invoice ${openInvoice.invoiceNumber} is overdue. Please pay KES ${openInvoice.balanceDue} using account ${subscription.billingAccount.accountNumber}.`,
        );
      }
      if (
        subscription.graceEndsAt &&
        now >= subscription.graceEndsAt &&
        subscription.status !== 'SUSPENDED'
      ) {
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'SUSPENDED', suspendedAt: now },
        });
        await this.sendInvoiceNotification(
          openInvoice.id,
          'SUSPENDED',
          'XpertFarmer: your subscription is suspended due to non-payment. Log in to pay and restore service.',
        );
      }
      if (
        subscription.suspendedAt &&
        now >= this.addDays(subscription.suspendedAt, terminationDays) &&
        subscription.status !== 'TERMINATED'
      ) {
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'TERMINATED', terminatedAt: now },
        });
        await this.sendInvoiceNotification(
          openInvoice.id,
          'TERMINATED',
          'XpertFarmer: your account has been terminated after prolonged suspension. Contact support to reactivate with an annual subscription.',
        );
      }
    }
    return { processedAt: now, subscriptions: subscriptions.length };
  }

  private async settlePayment(
    paymentId: string,
    amount: Prisma.Decimal,
    receipt: string,
    payload: any,
    phone?: string,
    targetInvoiceId?: string,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUniqueOrThrow({
        where: { id: paymentId },
      });
      if (payment.status === 'SUCCESS') return;
      const invoices = await tx.invoice.findMany({
        where: {
          billingAccountId: payment.billingAccountId,
          status: { in: ['OPEN', 'PARTIALLY_PAID', 'OVERDUE'] },
        },
        orderBy: { dueAt: 'asc' },
        include: { subscription: true },
      });
      if (targetInvoiceId) {
        invoices.sort((first, second) =>
          first.id === targetInvoiceId
            ? -1
            : second.id === targetInvoiceId
              ? 1
              : 0,
        );
      }
      let remaining = amount;
      for (const invoice of invoices) {
        if (remaining.lte(0)) break;
        const balance = new Prisma.Decimal(invoice.balanceDue);
        const allocation = Prisma.Decimal.min(balance, remaining);
        const newPaid = new Prisma.Decimal(invoice.amountPaid).plus(allocation);
        const newBalance = balance.minus(allocation);
        await tx.paymentAllocation.create({
          data: { paymentId, invoiceId: invoice.id, amount: allocation },
        });
        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            amountPaid: newPaid,
            balanceDue: newBalance,
            status: newBalance.eq(0) ? 'PAID' : 'PARTIALLY_PAID',
          },
        });
        if (newBalance.eq(0)) {
          await tx.subscription.update({
            where: { id: invoice.subscriptionId },
            data: {
              status: 'ACTIVE',
              currentPeriodStartAt: invoice.periodStartAt,
              currentPeriodEndAt: invoice.periodEndAt,
              graceEndsAt: null,
              suspendedAt: null,
              terminatedAt: null,
            },
          });
        }
        remaining = remaining.minus(allocation);
      }
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: remaining.gt(0) ? 'UNMATCHED' : 'SUCCESS',
          amount,
          mpesaReceiptNumber: receipt || undefined,
          payerPhone: phone || undefined,
          providerPayload: payload,
          completedAt: new Date(),
        },
      });
    });
    const payment = await this.prisma.payment.findUniqueOrThrow({
      where: { id: paymentId },
      include: { billingAccount: { include: { user: true } } },
    });
    if (payment.status === 'SUCCESS') await this.sendPaymentReceipt(payment.id);
  }

  private async createInvoiceForSubscription(
    subscriptionId: string,
    issuedAt: Date,
    dueAt: Date,
  ) {
    const subscription = await this.prisma.subscription.findUniqueOrThrow({
      where: { id: subscriptionId },
      include: { farm: true, billingAccount: true },
    });
    const periodStartAt = dueAt;
    const periodEndAt = this.addMonths(
      periodStartAt,
      subscription.billingCycle === 'ANNUAL' ? 12 : 1,
    );
    const lines = await this.calculateLines(
      subscription.farmId,
      subscription.billingCycle,
    );
    const total = lines.reduce(
      (sum, line) => sum.plus(line.amount),
      new Prisma.Decimal(0),
    );
    const status = total.eq(0) ? 'UNPRICED' : 'OPEN';
    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber: await this.nextInvoiceNumber(),
        billingAccountId: subscription.billingAccountId,
        subscriptionId,
        status,
        issuedAt,
        dueAt,
        periodStartAt,
        periodEndAt,
        totalAmount: total,
        balanceDue: total,
        billingSnapshot: {
          billingCycle: subscription.billingCycle,
          farmId: subscription.farmId,
          generatedAt: issuedAt.toISOString(),
        },
        lines: {
          create: lines.map((line) => ({
            billingPlanId: line.plan.id,
            description: line.plan.name,
            unitAmount: line.amount,
            lineAmount: line.amount,
            pricingSnapshot: {
              code: line.plan.code,
              metric: line.plan.metric,
              minValue: line.plan.minValue,
              maxValue: line.plan.maxValue,
              monthlyAmount: line.plan.monthlyAmount.toString(),
              observedValue: line.observedValue,
              billingCycle: subscription.billingCycle,
            },
          })),
        },
      },
    });
    return invoice;
  }

  private async repriceInvoice(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { allocations: true },
    });
    if (!invoice || invoice.allocations.length) return;
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: invoice.subscriptionId },
    });
    if (!subscription) return;
    const lines = await this.calculateLines(
      subscription.farmId,
      subscription.billingCycle,
    );
    if (!lines.some((line) => line.amount.gt(0))) return;
    await this.prisma.invoice.delete({ where: { id: invoice.id } });
    await this.createInvoiceForSubscription(
      invoice.subscriptionId,
      invoice.issuedAt,
      invoice.dueAt,
    );
  }

  private async ensureInitialInvoice(subscription: {
    id: string;
    startedAt: Date;
    trialEndsAt: Date;
  }) {
    const exists = await this.prisma.invoice.findFirst({
      where: {
        subscriptionId: subscription.id,
        periodStartAt: subscription.trialEndsAt,
      },
      select: { id: true },
    });
    if (!exists) {
      await this.createInvoiceForSubscription(
        subscription.id,
        subscription.startedAt,
        subscription.trialEndsAt,
      );
    }
  }

  private async calculateLines(farmId: string, billingCycle: string) {
    const farm = await this.prisma.farm.findUniqueOrThrow({
      where: { id: farmId },
      include: { livestock: { include: { poultry: true } } },
    });
    const [plans, strategy] = await Promise.all([
      this.prisma.billingPlan.findMany({ where: { isActive: true } }),
      this.setting('PRICING_COMBINATION_STRATEGY', 'SUM'),
    ]);
    const mammalCount = farm.livestock.filter(
      (item) => item.status === 'active' && item.category === 'mammal',
    ).length;
    const poultryCount = farm.livestock
      .filter((item) => item.status === 'active' && item.category === 'poultry')
      .reduce((sum, item) => sum + (item.poultry?.currentQuantity || 0), 0);
    const hasCrops = farm.farmingTypes.some((type) =>
      type.toLowerCase().includes('crop'),
    );
    const candidates = [
      mammalCount > 0
        ? this.findTier(plans, 'LIVESTOCK_COUNT', mammalCount)
        : undefined,
      poultryCount > 0
        ? plans.find((plan) => plan.metric === 'POULTRY_FLAT')
        : undefined,
      hasCrops && farm.size > 0
        ? this.findTier(plans, 'CROPS_ACRES', Math.ceil(farm.size))
        : undefined,
    ].filter(Boolean) as any[];
    const filtered =
      strategy === 'LIVESTOCK_ONLY'
        ? candidates.filter((plan) => plan.metric !== 'CROPS_ACRES')
        : strategy === 'CROPS_ONLY'
          ? candidates.filter((plan) => plan.metric === 'CROPS_ACRES')
          : candidates;
    const selected =
      strategy === 'HIGHEST' && filtered.length
        ? [
            filtered.sort(
              (a, b) => Number(b.monthlyAmount) - Number(a.monthlyAmount),
            )[0],
          ]
        : filtered;
    return selected.map((plan) => ({
      plan,
      observedValue:
        plan.metric === 'LIVESTOCK_COUNT'
          ? mammalCount
          : plan.metric === 'POULTRY_FLAT'
            ? poultryCount
            : farm.size,
      amount: new Prisma.Decimal(plan.monthlyAmount).mul(
        billingCycle === 'ANNUAL' ? 12 : 1,
      ),
    }));
  }

  private findTier(plans: any[], metric: string, value: number) {
    return plans.find(
      (plan) =>
        plan.metric === metric &&
        (plan.minValue === null || value >= plan.minValue) &&
        (plan.maxValue === null || value <= plan.maxValue),
    );
  }
  private accessStatus(
    subscription: {
      status: string;
      trialEndsAt: Date;
      graceEndsAt?: Date | null;
    },
    now: Date,
  ) {
    if (
      subscription.status === 'TERMINATED' ||
      subscription.status === 'SUSPENDED'
    )
      return subscription.status;
    if (now < subscription.trialEndsAt) return 'TRIAL';
    if (subscription.graceEndsAt && now < subscription.graceEndsAt)
      return 'GRACE';
    return subscription.status === 'ACTIVE' ? 'ACTIVE' : 'GRACE';
  }
  private async setting(key: string, fallback: string) {
    return (
      (await this.prisma.billingSetting.findUnique({ where: { key } }))
        ?.value || fallback
    );
  }
  private async settingNumber(key: string, fallback: number) {
    const value = Number(await this.setting(key, String(fallback)));
    return Number.isFinite(value) ? value : fallback;
  }
  private async nextAccountNumber() {
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = `XP${randomInt(10_000_000, 100_000_000)}`;
      if (
        !(await this.prisma.billingAccount.findUnique({
          where: { accountNumber: candidate },
        }))
      )
        return candidate;
    }
    throw new BadRequestException(
      'Could not generate a unique payment account number',
    );
  }
  private async nextInvoiceNumber(
    client: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = `INV-${new Date().getFullYear()}-${randomInt(100_000_000, 1_000_000_000)}`;
      if (
        !(await client.invoice.findUnique({
          where: { invoiceNumber: candidate },
        }))
      )
        return candidate;
    }
    throw new BadRequestException('Could not generate a unique invoice number');
  }
  private addDays(date: Date, days: number) {
    const copy = new Date(date);
    copy.setUTCDate(copy.getUTCDate() + days);
    return copy;
  }
  private addMonths(date: Date, months: number) {
    const copy = new Date(date);
    copy.setUTCMonth(copy.getUTCMonth() + months);
    return copy;
  }
  private normalisePhone(phone: string) {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('254') && digits.length === 12) return digits;
    if (digits.startsWith('0') && digits.length === 10)
      return `254${digits.slice(1)}`;
    throw new BadRequestException('Enter a valid Kenyan phone number');
  }
  private mpesaTimestamp() {
    const d = new Date();
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
      String(d.getHours()).padStart(2, '0'),
      String(d.getMinutes()).padStart(2, '0'),
      String(d.getSeconds()).padStart(2, '0'),
    ].join('');
  }
  private mpesaBaseUrl() {
    return this.config.get('MPESA_ENV') === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }
  private requiredConfig(key: string) {
    const value = this.config.get<string>(key);
    if (!value) throw new BadRequestException(`${key} is not configured`);
    return value;
  }
  private async mpesaToken() {
    const credentials = Buffer.from(
      `${this.requiredConfig('MPESA_CONSUMER_KEY')}:${this.requiredConfig('MPESA_CONSUMER_SECRET')}`,
    ).toString('base64');
    const response = await axios.get(
      `${this.mpesaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${credentials}` } },
    );
    return response.data.access_token;
  }
  private async sendInvoiceNotification(
    invoiceId: string,
    eventType: string,
    message: string,
  ) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { billingAccount: { include: { user: true } } },
    });
    if (!invoice) return;
    try {
      const notification = await this.prisma.billingNotification.create({
        data: {
          invoiceId,
          billingAccountId: invoice.billingAccountId,
          eventType,
          recipient: invoice.billingAccount.user.phoneNumber,
          message,
        },
      });
      const sent = await this.notifications.sendSMS(
        notification.recipient,
        message,
      );
      await this.prisma.billingNotification.update({
        where: { id: notification.id },
        data: sent
          ? { status: 'SENT', sentAt: new Date() }
          : {
              status: 'FAILED',
              failedAt: new Date(),
              failureReason: 'SMS provider rejected request',
            },
      });
    } catch (error: any) {
      if (error.code !== 'P2002') throw error;
    }
  }
  private async sendPaymentReceipt(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { billingAccount: { include: { user: true } } },
    });
    if (!payment) return;
    const message = `XpertFarmer: payment of KES ${payment.amount} received. Receipt: ${payment.mpesaReceiptNumber || payment.providerTransaction || payment.id}. Thank you.`;
    try {
      const notification = await this.prisma.billingNotification.create({
        data: {
          billingAccountId: payment.billingAccountId,
          eventType: `PAYMENT_RECEIPT_${payment.id}`,
          recipient: payment.billingAccount.user.phoneNumber,
          message,
        },
      });
      const sent = await this.notifications.sendSMS(
        notification.recipient,
        message,
      );
      await this.prisma.billingNotification.update({
        where: { id: notification.id },
        data: sent
          ? { status: 'SENT', sentAt: new Date() }
          : { status: 'FAILED', failedAt: new Date() },
      });
    } catch (error: any) {
      if (error.code !== 'P2002') throw error;
    }
  }
  private errorMessage(error: any) {
    return (
      error?.response?.data?.errorMessage ||
      error?.message ||
      'Unknown provider error'
    );
  }
}
