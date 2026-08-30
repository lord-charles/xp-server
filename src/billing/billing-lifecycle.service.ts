import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { BillingService } from './billing.service';

@Injectable()
export class BillingLifecycleService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BillingLifecycleService.name);
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(private readonly billing: BillingService) {}

  onModuleInit() {
    void this.run();
    // The lifecycle logic is idempotent at database level; a worker/queue can
    // replace this timer later without changing billing rules.
    this.timer = setInterval(() => void this.run(), 60 * 60 * 1000);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private async run() {
    if (this.running) return;
    this.running = true;
    try {
      await this.billing.processLifecycle();
    } catch (error) {
      this.logger.error(
        'Billing lifecycle run failed',
        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      this.running = false;
    }
  }
}
