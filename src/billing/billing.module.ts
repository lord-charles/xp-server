import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';
import { BillingController } from './billing.controller';
import { BillingLifecycleService } from './billing-lifecycle.service';
import { BillingService } from './billing.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [BillingController],
  providers: [BillingService, BillingLifecycleService],
  exports: [BillingService],
})
export class BillingModule {}
