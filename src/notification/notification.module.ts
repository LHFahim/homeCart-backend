import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { CartEntity, CartItemEntity } from 'src/cart/entities/cart.entity';
import { HouseholdEntity } from 'src/household/entities/household.entity';
import { PushSubscriptionEntity } from './entities/push-subscription.entity';
import { HighPriorityReminderSchedulerService } from './high-priority-reminder-scheduler.service';
import { HighPriorityReminderService } from './high-priority-reminder.service';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    TypegooseModule.forFeature([
      PushSubscriptionEntity,
      CartEntity,
      CartItemEntity,
      HouseholdEntity,
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    HighPriorityReminderService,
    HighPriorityReminderSchedulerService,
  ],
})
export class NotificationModule {}
