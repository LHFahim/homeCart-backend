import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HighPriorityReminderService } from './high-priority-reminder.service';

@Injectable()
export class HighPriorityReminderSchedulerService {
  private readonly logger = new Logger(
    HighPriorityReminderSchedulerService.name,
  );

  constructor(
    private readonly highPriorityReminderService: HighPriorityReminderService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'high-priority-cart-item-reminders',
    timeZone: process.env.REMINDER_TIMEZONE || 'Australia/Sydney',
    waitForCompletion: true,
  })
  async runScheduledHighPriorityReminder(): Promise<void> {
    const startTime = Date.now();

    this.logger.log('High-priority reminder run started');

    const enabled = process.env.HIGH_PRIORITY_REMINDERS_ENABLED === 'true';

    if (!enabled) {
      const durationMs = Date.now() - startTime;

      this.logger.log(
        'High-priority reminder run is disabled because HIGH_PRIORITY_REMINDERS_ENABLED is not true',
      );
      this.logger.log(
        `High-priority reminder run completed usersConsidered=0 usersNotified=0 notificationsSent=0 failures=0 usersWithNoPushSubscriptions=0 durationMs=${durationMs}`,
      );
      return;
    }

    try {
      const summary =
        await this.highPriorityReminderService.sendHighPriorityRemindersWithOverlapProtection();
      const durationMs = Date.now() - startTime;

      this.logger.log(
        `High-priority reminder run completed usersConsidered=${summary.usersConsidered} usersNotified=${summary.usersNotified} notificationsSent=${summary.notificationsSent} failures=${summary.failures} usersWithNoPushSubscriptions=${summary.usersWithNoPushSubscriptions} durationMs=${durationMs}`,
      );
    } catch (error) {
      const durationMs = Date.now() - startTime;
      this.logger.error(
        'High-priority reminder run failed',
        error instanceof Error ? error.stack : 'Unknown error',
      );
      this.logger.log(
        `High-priority reminder run completed usersConsidered=0 usersNotified=0 notificationsSent=0 failures=1 usersWithNoPushSubscriptions=0 durationMs=${durationMs}`,
      );
    }
  }
}
