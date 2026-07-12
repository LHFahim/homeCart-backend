import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import { Model, Types } from 'mongoose';
import { InjectModel } from 'nestjs-typegoose';
import * as webPush from 'web-push';
import { SubscribePushDto } from './dto/push-subscription.dto';
import { PushSubscriptionEntity } from './entities/push-subscription.entity';

export interface PushNotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

interface WebPushErrorLike {
  statusCode?: number;
  body?: string;
  message?: string;
}

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);

  private readonly vapidPublicKey = process.env.WEB_PUSH_PUBLIC_KEY;

  private readonly vapidPrivateKey = process.env.WEB_PUSH_PRIVATE_KEY;

  private readonly vapidSubject = process.env.WEB_PUSH_SUBJECT;

  constructor(
    @InjectModel(PushSubscriptionEntity)
    private readonly pushSubscriptionModel: Model<PushSubscriptionEntity>,
  ) {}

  onModuleInit(): void {
    if (!this.vapidPublicKey || !this.vapidPrivateKey || !this.vapidSubject) {
      throw new InternalServerErrorException(
        'Web Push environment variables are missing',
      );
    }

    webPush.setVapidDetails(
      this.vapidSubject,
      this.vapidPublicKey,
      this.vapidPrivateKey,
    );
  }

  getPublicKey(): string {
    if (!this.vapidPublicKey) {
      throw new InternalServerErrorException(
        'Web Push public key is not configured',
      );
    }

    return this.vapidPublicKey;
  }

  async subscribe(userId: string, dto: SubscribePushDto, userAgent?: string) {
    const mongoUserId = new Types.ObjectId(userId);

    /*
     * The endpoint uniquely represents this browser subscription.
     *
     * Upsert prevents duplicate documents when the frontend sends the
     * same subscription again after login or page refresh.
     */

    return this.pushSubscriptionModel.findOneAndUpdate(
      {
        endpoint: dto.endpoint,
      },
      {
        $set: {
          userId: mongoUserId,
          endpoint: dto.endpoint,
          expirationTime: dto.expirationTime ?? null,
          keys: {
            p256dh: dto.keys.p256dh,
            auth: dto.keys.auth,
          },
          userAgent: userAgent ?? null,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );
  }

  async unsubscribe(
    userId: string,
    endpoint: string,
  ): Promise<{ deleted: boolean }> {
    const result = await this.pushSubscriptionModel.deleteOne({
      userId: new Types.ObjectId(userId),
      endpoint,
    });

    return {
      deleted: result.deletedCount > 0,
    };
  }

  async sendToUser(
    userId: string,
    payload: PushNotificationPayload,
  ): Promise<{
    subscriptions: number;
    sent: number;
    failed: number;
    removed: number;
  }> {
    const subscriptions = await this.pushSubscriptionModel.find({
      userId: new Types.ObjectId(userId),
    });

    let sent = 0;
    let failed = 0;
    let removed = 0;

    await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        const pushSubscription: webPush.PushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          },
        };

        try {
          await webPush.sendNotification(
            pushSubscription,
            JSON.stringify(payload),
            {
              TTL: 60,
              urgency: 'normal',
            },
          );

          sent += 1;
        } catch (error: unknown) {
          const pushError = error as WebPushErrorLike;
          const statusCode = pushError.statusCode;

          /*
           * these commonly indicate that the browser subscription
           * no longer exists or should no longer be used.
           */

          if (statusCode === 404 || statusCode === 410) {
            await this.pushSubscriptionModel.deleteOne({
              _id: subscription._id,
            });

            removed += 1;
            return;
          }

          failed += 1;

          this.logger.error(
            `Push notification failed for endpoint ${subscription.endpoint}`,
            pushError.body ?? pushError.message ?? 'Unknown Web Push error',
          );
        }
      }),
    );

    return {
      subscriptions: subscriptions.length,
      sent,
      failed,
      removed,
    };
  }

  async sendToUsers(userIds: string[], payload: PushNotificationPayload) {
    const uniqueUserIds = [...new Set(userIds)];

    const results = await Promise.all(
      uniqueUserIds.map((userId) => this.sendToUser(userId, payload)),
    );

    return results.reduce(
      (total, result) => ({
        subscriptions: total.subscriptions + result.subscriptions,
        sent: total.sent + result.sent,
        failed: total.failed + result.failed,
        removed: total.removed + result.removed,
      }),
      {
        subscriptions: 0,
        sent: 0,
        failed: 0,
        removed: 0,
      },
    );
  }
}
