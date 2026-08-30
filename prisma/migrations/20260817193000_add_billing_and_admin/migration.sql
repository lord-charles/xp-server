-- Billing is a separate revenue domain. This migration is additive and safe for
-- databases where the earlier soft-delete change was applied through db push.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "Admin" (
  "id" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phoneNumber" TEXT,
  "passwordHash" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastLoginAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Admin_phoneNumber_key" ON "Admin"("phoneNumber");

CREATE TABLE IF NOT EXISTS "BillingAccount" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "accountNumber" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BillingAccount_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BillingAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "BillingAccount_userId_key" ON "BillingAccount"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "BillingAccount_accountNumber_key" ON "BillingAccount"("accountNumber");
CREATE INDEX IF NOT EXISTS "BillingAccount_status_idx" ON "BillingAccount"("status");

CREATE TABLE IF NOT EXISTS "BillingPlan" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "metric" TEXT NOT NULL,
  "minValue" INTEGER,
  "maxValue" INTEGER,
  "monthlyAmount" DECIMAL(12,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'KES',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isSystemSeed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BillingPlan_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "BillingPlan_code_key" ON "BillingPlan"("code");
CREATE INDEX IF NOT EXISTS "BillingPlan_metric_isActive_idx" ON "BillingPlan"("metric", "isActive");

CREATE TABLE IF NOT EXISTS "BillingSetting" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "description" TEXT,
  "isSystemSeed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BillingSetting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "BillingSetting_key_key" ON "BillingSetting"("key");

CREATE TABLE IF NOT EXISTS "Subscription" (
  "id" TEXT NOT NULL,
  "billingAccountId" TEXT NOT NULL,
  "farmId" TEXT NOT NULL,
  "billingCycle" TEXT NOT NULL DEFAULT 'MONTHLY',
  "status" TEXT NOT NULL DEFAULT 'TRIAL',
  "startedAt" TIMESTAMP(3) NOT NULL,
  "trialEndsAt" TIMESTAMP(3) NOT NULL,
  "currentPeriodStartAt" TIMESTAMP(3),
  "currentPeriodEndAt" TIMESTAMP(3),
  "graceEndsAt" TIMESTAMP(3),
  "suspendedAt" TIMESTAMP(3),
  "terminatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Subscription_billingAccountId_fkey" FOREIGN KEY ("billingAccountId") REFERENCES "BillingAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Subscription_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_farmId_key" ON "Subscription"("farmId");
CREATE INDEX IF NOT EXISTS "Subscription_billingAccountId_status_idx" ON "Subscription"("billingAccountId", "status");
CREATE INDEX IF NOT EXISTS "Subscription_trialEndsAt_status_idx" ON "Subscription"("trialEndsAt", "status");

CREATE TABLE IF NOT EXISTS "Invoice" (
  "id" TEXT NOT NULL,
  "invoiceNumber" TEXT NOT NULL,
  "billingAccountId" TEXT NOT NULL,
  "subscriptionId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "currency" TEXT NOT NULL DEFAULT 'KES',
  "issuedAt" TIMESTAMP(3) NOT NULL,
  "dueAt" TIMESTAMP(3) NOT NULL,
  "periodStartAt" TIMESTAMP(3) NOT NULL,
  "periodEndAt" TIMESTAMP(3) NOT NULL,
  "totalAmount" DECIMAL(12,2) NOT NULL,
  "amountPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "balanceDue" DECIMAL(12,2) NOT NULL,
  "billingSnapshot" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Invoice_billingAccountId_fkey" FOREIGN KEY ("billingAccountId") REFERENCES "BillingAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_subscriptionId_periodStartAt_periodEndAt_key" ON "Invoice"("subscriptionId", "periodStartAt", "periodEndAt");
CREATE INDEX IF NOT EXISTS "Invoice_billingAccountId_status_dueAt_idx" ON "Invoice"("billingAccountId", "status", "dueAt");

CREATE TABLE IF NOT EXISTS "InvoiceLine" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "billingPlanId" TEXT,
  "description" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "unitAmount" DECIMAL(12,2) NOT NULL,
  "lineAmount" DECIMAL(12,2) NOT NULL,
  "pricingSnapshot" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "InvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "InvoiceLine_billingPlanId_fkey" FOREIGN KEY ("billingPlanId") REFERENCES "BillingPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "InvoiceLine_invoiceId_idx" ON "InvoiceLine"("invoiceId");

CREATE TABLE IF NOT EXISTS "Payment" (
  "id" TEXT NOT NULL,
  "billingAccountId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "amount" DECIMAL(12,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'KES',
  "payerPhone" TEXT,
  "accountReference" TEXT,
  "merchantRequestId" TEXT,
  "checkoutRequestId" TEXT,
  "mpesaReceiptNumber" TEXT,
  "providerTransaction" TEXT,
  "providerPayload" JSONB,
  "failureReason" TEXT,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Payment_billingAccountId_fkey" FOREIGN KEY ("billingAccountId") REFERENCES "BillingAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_merchantRequestId_key" ON "Payment"("merchantRequestId");
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_checkoutRequestId_key" ON "Payment"("checkoutRequestId");
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_mpesaReceiptNumber_key" ON "Payment"("mpesaReceiptNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_providerTransaction_key" ON "Payment"("providerTransaction");
CREATE INDEX IF NOT EXISTS "Payment_billingAccountId_status_createdAt_idx" ON "Payment"("billingAccountId", "status", "createdAt");

CREATE TABLE IF NOT EXISTS "PaymentAllocation" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentAllocation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PaymentAllocation_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PaymentAllocation_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentAllocation_paymentId_invoiceId_key" ON "PaymentAllocation"("paymentId", "invoiceId");
CREATE INDEX IF NOT EXISTS "PaymentAllocation_invoiceId_idx" ON "PaymentAllocation"("invoiceId");

CREATE TABLE IF NOT EXISTS "BillingNotification" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT,
  "billingAccountId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "channel" TEXT NOT NULL DEFAULT 'SMS',
  "recipient" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "providerMessageId" TEXT,
  "sentAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "failureReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BillingNotification_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BillingNotification_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "BillingNotification_invoiceId_eventType_channel_key" ON "BillingNotification"("invoiceId", "eventType", "channel");
CREATE INDEX IF NOT EXISTS "BillingNotification_billingAccountId_eventType_idx" ON "BillingNotification"("billingAccountId", "eventType");
