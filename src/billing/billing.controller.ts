import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillingService } from './billing.service';
import {
  CreateOrUpdatePlanDto,
  CreateAdminInvoiceDto,
  InitiateAdminStkPushDto,
  InitiateStkPushDto,
  OverrideInvoicePlanDto,
  RecordMpesaPaymentDto,
  RecordManualPaymentDto,
  UpdateBillingSettingDto,
  UpdateSubscriptionDto,
} from './dto/billing.dto';
import { SubscriptionExempt } from './decorators/subscription-exempt.decorator';

const C2B_EXAMPLE = {
  TransactionType: 'Pay Bill',
  TransID: 'QWE123ABC',
  TransTime: '20260817201530',
  TransAmount: '100.00',
  BusinessShortCode: '123456',
  BillRefNumber: 'XP12345678',
  MSISDN: '254712345678',
  FirstName: 'Jane',
  LastName: 'Doe',
};

@ApiTags('billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@SubscriptionExempt()
@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get('me')
  @ApiOperation({
    summary:
      'Get the signed-in farmer billing account, subscriptions, and recent invoices',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: 'cm1account',
        accountNumber: 'XP12345678',
        status: 'ACTIVE',
        subscriptions: [
          {
            id: 'cm1subscription',
            billingCycle: 'MONTHLY',
            status: 'TRIAL',
            trialEndsAt: '2026-09-16T00:00:00.000Z',
          },
        ],
        invoices: [
          {
            invoiceNumber: 'INV-2026-123456789',
            totalAmount: '100.00',
            balanceDue: '100.00',
            dueAt: '2026-09-16T00:00:00.000Z',
          },
        ],
      },
    },
  })
  getMyBilling(@Req() req: any) {
    return this.billing.getMyBilling(req.user.id);
  }

  @Get('access')
  @ApiOperation({
    summary:
      'Get the subscription access decision used by the mobile-app paywall',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: { allowed: true, status: 'TRIAL', accountNumber: 'XP12345678' },
    },
  })
  getAccess(@Req() req: any) {
    return this.billing.getAccess(req.user);
  }

  @Get('plans')
  @ApiOperation({ summary: 'List active billing pricing plans' })
  @ApiResponse({
    status: 200,
    schema: {
      example: [
        {
          code: 'CROPS_SMALL',
          name: 'Crops Small',
          metric: 'CROPS_ACRES',
          minValue: 4,
          maxValue: 10,
          monthlyAmount: '500.00',
          isActive: true,
        },
      ],
    },
  })
  listPlans() {
    return this.billing.listPlans();
  }

  @Patch('subscriptions/:id/cycle')
  @ApiOperation({
    summary: 'Choose monthly or annual billing before payment is allocated',
  })
  @ApiBody({ type: UpdateSubscriptionDto })
  selectBillingCycle(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    return this.billing.selectBillingCycle(req.user.id, id, dto);
  }

  @Post('payments/mpesa/stk-push')
  @ApiOperation({
    summary: 'Initiate an M-Pesa STK push for an unpaid invoice',
  })
  @ApiBody({ type: InitiateStkPushDto })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        paymentId: 'cm1payment',
        checkoutRequestId: 'ws_CO_17082026123456789',
        customerMessage: 'Success. Request accepted for processing',
      },
    },
  })
  initiateStk(@Req() req: any, @Body() dto: InitiateStkPushDto) {
    return this.billing.initiateStkPush(req.user.id, dto);
  }

  @Get('customers')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: list billing customers' })
  listCustomers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.billing.listCustomers(
      Number(page) || 1,
      Number(limit) || 20,
      search,
      status,
    );
  }

  @Get('admin/customers/:userId')
  @Roles('ADMIN')
  @ApiOperation({
    summary:
      'Admin: get a customer profile with billing account, subscriptions, invoices, and payments',
  })
  getCustomerDetails(@Param('userId') userId: string) {
    return this.billing.getCustomerDetails(userId);
  }

  @Post('admin/customers/:userId/provision')
  @Roles('ADMIN')
  @ApiOperation({
    summary:
      'Admin: create a billing account, subscriptions, and first invoices for one existing farmer',
  })
  provisionCustomer(@Param('userId') userId: string) {
    return this.billing.provisionCustomer(userId);
  }

  @Post('admin/customers/:userId/invoices')
  @Roles('ADMIN')
  @ApiOperation({
    summary:
      'Admin: override automated pricing by creating a selected-plan invoice for the current period',
  })
  @ApiBody({ type: CreateAdminInvoiceDto })
  createAdminInvoice(
    @Param('userId') userId: string,
    @Body() dto: CreateAdminInvoiceDto,
  ) {
    return this.billing.createAdminInvoice(userId, dto);
  }

  @Get('invoices')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: list invoices' })
  listInvoices(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.billing.listInvoices(
      Number(page) || 1,
      Number(limit) || 20,
      status,
      customerId,
    );
  }

  @Get('stats/overview')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: get billing dashboard totals' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        data: {
          totalCustomers: 24,
          activeCustomers: 20,
          suspendedCustomers: 2,
          overdueCustomers: 2,
          totalInvoices: 42,
          pendingInvoices: 8,
          paidInvoices: 34,
          totalRevenue: 125000,
          outstandingAmount: 7500,
          monthlyRevenue: 15000,
        },
        success: true,
      },
    },
  })
  billingStats() {
    return this.billing.billingStats();
  }

  @Public()
  @Post('stk/callback')
  @ApiOperation({
    summary:
      'Daraja callback: STK payment result. Do not call from a client app.',
  })
  @ApiBody({
    schema: {
      example: {
        Body: {
          stkCallback: {
            MerchantRequestID: '29115-34620561-1',
            CheckoutRequestID: 'ws_CO_17082026123456789',
            ResultCode: 0,
            ResultDesc: 'The service request is processed successfully.',
            CallbackMetadata: {
              Item: [
                { Name: 'Amount', Value: 100 },
                { Name: 'MpesaReceiptNumber', Value: 'QWE123ABC' },
                { Name: 'PhoneNumber', Value: 254712345678 },
                { Name: 'TransactionDate', Value: 20260817201530 },
              ],
            },
          },
        },
      },
    },
  })
  stkCallback(@Body() payload: any) {
    return this.billing.handleStkCallback(payload);
  }

  @Public()
  @Post('c2b/validation')
  @ApiOperation({
    summary: 'Daraja callback: validate an offline PayBill account number',
  })
  @ApiBody({ schema: { example: C2B_EXAMPLE } })
  validateC2b(@Body() payload: any) {
    return this.billing.validateC2b(payload);
  }

  @Public()
  @Post('c2b/confirmation')
  @ApiOperation({
    summary:
      'Daraja callback: confirm an offline PayBill payment and allocate it to invoices',
  })
  @ApiBody({ schema: { example: C2B_EXAMPLE } })
  confirmC2b(@Body() payload: any) {
    return this.billing.confirmC2b(payload);
  }

  @Get('admin/settings')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: list editable billing policy settings' })
  listSettings() {
    return this.billing.listSettings();
  }

  @Patch('admin/settings/:key')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: update a billing policy setting' })
  @ApiBody({ type: UpdateBillingSettingDto })
  updateSetting(
    @Param('key') key: string,
    @Body() dto: UpdateBillingSettingDto,
  ) {
    return this.billing.updateSetting(key, dto.value);
  }

  @Post('admin/plans')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: create or update a pricing plan by code' })
  @ApiBody({ type: CreateOrUpdatePlanDto })
  savePlan(@Body() dto: CreateOrUpdatePlanDto) {
    return this.billing.savePlan(dto);
  }

  @Post('admin/accounts/backfill')
  @Roles('ADMIN')
  @ApiOperation({
    summary:
      'Admin: create billing accounts and subscriptions for existing farmers',
  })
  @ApiResponse({
    status: 201,
    schema: { example: { scannedUsers: 120, createdAccounts: 118 } },
  })
  backfillAccounts() {
    return this.billing.backfillAccounts();
  }

  @Patch('admin/subscriptions/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: change a subscription billing cycle' })
  @ApiBody({ type: UpdateSubscriptionDto })
  updateSubscription(
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    return this.billing.updateSubscription(id, dto);
  }

  @Post('admin/invoices/:id/payments/mpesa/stk-push')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Admin: send an M-Pesa STK push for this customer invoice',
  })
  @ApiBody({ type: InitiateAdminStkPushDto })
  initiateAdminStk(
    @Param('id') invoiceId: string,
    @Body() dto: InitiateAdminStkPushDto,
  ) {
    return this.billing.initiateAdminStkPush(invoiceId, dto.phoneNumber);
  }

  @Patch('admin/invoices/:id/plan')
  @Roles('ADMIN')
  @ApiOperation({
    summary:
      'Admin: make an unpriced or unpaid invoice payable with a selected configured billing plan',
  })
  @ApiBody({ type: OverrideInvoicePlanDto })
  overrideInvoicePlan(
    @Param('id') invoiceId: string,
    @Body() dto: OverrideInvoicePlanDto,
  ) {
    return this.billing.overrideInvoicePlan(invoiceId, dto.planId);
  }

  @Post('admin/invoices/:id/payments')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: record a bank, cheque, or cash payment' })
  @ApiBody({ type: RecordManualPaymentDto })
  recordManualPayment(
    @Param('id') id: string,
    @Body() dto: RecordManualPaymentDto,
  ) {
    return this.billing.recordManualPayment(id, dto);
  }

  @Post('admin/invoices/:id/payments/mpesa/manual')
  @Roles('ADMIN')
  @ApiOperation({
    summary:
      'Admin: reconcile a completed M-Pesa payment by its receipt code and activate the paid subscription',
  })
  @ApiBody({ type: RecordMpesaPaymentDto })
  recordMpesaPayment(
    @Param('id') id: string,
    @Body() dto: RecordMpesaPaymentDto,
  ) {
    return this.billing.recordMpesaPayment(id, dto);
  }

  @Post('admin/payments/mpesa/c2b/register-urls')
  @Roles('ADMIN')
  @ApiOperation({
    summary:
      'Admin: register the configured offline PayBill callbacks with Daraja',
  })
  registerC2bUrls() {
    return this.billing.registerC2bUrls();
  }

  @Post('admin/lifecycle/run')
  @Roles('ADMIN')
  @ApiOperation({
    summary:
      'Admin: run trial, reminder, overdue, suspension, and termination processing now',
  })
  runLifecycle() {
    return this.billing.processLifecycle();
  }
}
