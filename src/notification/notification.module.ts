import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { PushSubscriptionEntity } from './entities/push-subscription.entity';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [TypegooseModule.forFeature([PushSubscriptionEntity])],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
