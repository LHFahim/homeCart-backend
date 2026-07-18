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

  @Cron(CronExpression.EVERY_DAY_AT_3PM, {
    name: 'high-priority-cart-item-reminders-3pm',
    timeZone: process.env.REMINDER_TIMEZONE || 'Australia/Sydney',
    waitForCompletion: true,
  })
  async runThreePmReminder(): Promise<void> {
    await this.runHighPriorityReminder('3 PM');
  }

  @Cron(CronExpression.EVERY_DAY_AT_11PM, {
    name: 'high-priority-cart-item-reminders-11pm',
    timeZone: process.env.REMINDER_TIMEZONE || 'Australia/Sydney',
    waitForCompletion: true,
  })
  async runElevenPmReminder(): Promise<void> {
    await this.runHighPriorityReminder('11 PM');
  }

  private async runHighPriorityReminder(scheduleLabel: string): Promise<void> {
    const startTime = Date.now();

    const enabled = process.env.HIGH_PRIORITY_REMINDERS_ENABLED === 'true';

    if (!enabled) {
      this.logger.warn(
        `${scheduleLabel} high-priority reminder skipped because HIGH_PRIORITY_REMINDERS_ENABLED is not true`,
      );

      return;
    }

    this.logger.log(`${scheduleLabel} high-priority reminder run started`);

    try {
      const summary =
        await this.highPriorityReminderService.sendHighPriorityRemindersWithOverlapProtection();

      const durationMs = Date.now() - startTime;

      this.logger.log(
        [
          `${scheduleLabel} high-priority reminder run completed`,
          `usersConsidered=${summary.usersConsidered}`,
          `usersNotified=${summary.usersNotified}`,
          `notificationsSent=${summary.notificationsSent}`,
          `failures=${summary.failures}`,
          `usersWithNoPushSubscriptions=${summary.usersWithNoPushSubscriptions}`,
          `durationMs=${durationMs}`,
        ].join(' '),
      );
    } catch (error: unknown) {
      const durationMs = Date.now() - startTime;

      this.logger.error(
        `${scheduleLabel} high-priority reminder run failed after ${durationMs}ms`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
