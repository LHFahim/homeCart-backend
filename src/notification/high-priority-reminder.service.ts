import { Injectable, Logger } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { InjectModel } from 'nestjs-typegoose';
import {
  CartEntity,
  CartItemEntity,
  CartItemPriorityEnum,
  CartStatusEnum,
} from 'src/cart/entities/cart.entity';
import { HouseholdEntity } from 'src/household/entities/household.entity';
import { NotificationService } from './notification.service';

export interface HighPriorityReminderSummary {
  usersConsidered: number;
  usersNotified: number;
  notificationsSent: number;
  failures: number;
  usersWithNoPushSubscriptions: number;
}

export interface HighPriorityReminderUserResult {
  matchingItems: number;
  subscriptions: number;
  sent: number;
  failed: number;
  removed: number;
  message?: string;
}

@Injectable()
export class HighPriorityReminderService {
  private readonly logger = new Logger(HighPriorityReminderService.name);
  private isSendAllRunInProgress = false;

  constructor(
    @InjectModel(CartItemEntity)
    private readonly cartItemModel: ReturnModelType<typeof CartItemEntity>,
    @InjectModel(CartEntity)
    private readonly cartModel: ReturnModelType<typeof CartEntity>,
    @InjectModel(HouseholdEntity)
    private readonly householdModel: ReturnModelType<typeof HouseholdEntity>,
    private readonly notificationService: NotificationService,
  ) {}

  async sendHighPriorityReminders(): Promise<HighPriorityReminderSummary> {
    const highPriorityItems = await this.cartItemModel.find({
      priority: CartItemPriorityEnum.HIGH,
      isPurchased: false,
      isActive: true,
      isDeleted: false,
    });

    if (!highPriorityItems.length) {
      const emptySummary: HighPriorityReminderSummary = {
        usersConsidered: 0,
        usersNotified: 0,
        notificationsSent: 0,
        failures: 0,
        usersWithNoPushSubscriptions: 0,
      };

      this.logger.log(
        `High-priority reminder summary: ${JSON.stringify(emptySummary)}`,
      );

      return emptySummary;
    }

    const cartIds = [
      ...new Set(highPriorityItems.map((item) => item.cartId.toString())),
    ].map((id) => new Types.ObjectId(id));

    const carts = await this.cartModel.find({
      _id: { $in: cartIds },
      isActive: true,
      isDeleted: false,
      status: CartStatusEnum.ACTIVE,
    });

    const validCartById = new Map(
      carts.map((cart) => [cart._id.toString(), cart]),
    );

    const householdIds = [
      ...new Set(carts.map((cart) => cart.householdId.toString())),
    ].map((id) => new Types.ObjectId(id));

    const households = await this.householdModel.find({
      _id: { $in: householdIds },
      isActive: true,
      isDeleted: false,
    });

    const validHouseholdById = new Map(
      households.map((household) => [household._id.toString(), household]),
    );

    const validItems = highPriorityItems.filter((item) => {
      const cart = validCartById.get(item.cartId.toString());

      if (!cart) {
        return false;
      }

      const household = validHouseholdById.get(item.householdId.toString());

      if (!household) {
        return false;
      }

      return cart.householdId.toString() === item.householdId.toString();
    });

    const userItemMap = new Map<string, CartItemEntity[]>();

    for (const item of validItems) {
      const household = validHouseholdById.get(item.householdId.toString());

      if (!household) {
        continue;
      }

      const recipientIds = new Set<string>([
        household.createdBy.toString(),
        ...household.members.map((member) => member.userId.toString()),
      ]);

      for (const userId of recipientIds) {
        const existing = userItemMap.get(userId) ?? [];
        existing.push(item);
        userItemMap.set(userId, existing);
      }
    }

    let usersNotified = 0;
    let notificationsSent = 0;
    let failures = 0;
    let usersWithNoPushSubscriptions = 0;

    for (const [userId, items] of userItemMap.entries()) {
      if (!items.length) {
        continue;
      }

      const payloadBody = this.buildBody(items.map((item) => item.name));

      try {
        const result = await this.notificationService.sendToUser(userId, {
          title: 'HomeCart reminder',
          body: payloadBody,
          url: this.buildReminderUrl(),
          tag: 'high-priority-reminder',
        });

        if (result.subscriptions === 0) {
          usersWithNoPushSubscriptions += 1;
        }

        notificationsSent += result.sent;
        failures += result.failed;

        if (result.sent > 0 || result.subscriptions > 0) {
          usersNotified += 1;
        }
      } catch (error) {
        failures += 1;
        this.logger.error(
          `Failed to send high-priority reminder to user ${userId}`,
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
    }

    const summary: HighPriorityReminderSummary = {
      usersConsidered: userItemMap.size,
      usersNotified,
      notificationsSent,
      failures,
      usersWithNoPushSubscriptions,
    };

    this.logger.log(
      `High-priority reminder summary: ${JSON.stringify(summary)}`,
    );

    return summary;
  }

  async sendHighPriorityRemindersWithOverlapProtection(): Promise<HighPriorityReminderSummary> {
    if (this.isSendAllRunInProgress) {
      this.logger.log(
        'High-priority reminder run skipped because another run is already in progress',
      );

      return {
        usersConsidered: 0,
        usersNotified: 0,
        notificationsSent: 0,
        failures: 0,
        usersWithNoPushSubscriptions: 0,
      };
    }

    this.isSendAllRunInProgress = true;

    try {
      return await this.sendHighPriorityReminders();
    } finally {
      this.isSendAllRunInProgress = false;
    }
  }

  async sendHighPriorityReminderToUser(
    userId: string,
  ): Promise<HighPriorityReminderUserResult> {
    const userObjectId = new Types.ObjectId(userId);

    const households = await this.householdModel.find({
      isActive: true,
      isDeleted: false,
      $or: [{ createdBy: userObjectId }, { 'members.userId': userObjectId }],
    });

    if (!households.length) {
      return {
        matchingItems: 0,
        subscriptions: 0,
        sent: 0,
        failed: 0,
        removed: 0,
        message: 'No high-priority items found for this user.',
      };
    }

    const householdIds = households.map((household) => household._id);

    const carts = await this.cartModel.find({
      householdId: { $in: householdIds },
      isActive: true,
      isDeleted: false,
      status: CartStatusEnum.ACTIVE,
    });

    if (!carts.length) {
      return {
        matchingItems: 0,
        subscriptions: 0,
        sent: 0,
        failed: 0,
        removed: 0,
        message: 'No high-priority items found for this user.',
      };
    }

    const cartIds = carts.map((cart) => cart._id);

    const items = await this.cartItemModel.find({
      cartId: { $in: cartIds },
      householdId: { $in: householdIds },
      priority: CartItemPriorityEnum.HIGH,
      isPurchased: false,
      isActive: true,
      isDeleted: false,
    });

    if (!items.length) {
      return {
        matchingItems: 0,
        subscriptions: 0,
        sent: 0,
        failed: 0,
        removed: 0,
        message: 'No high-priority items found for this user.',
      };
    }

    const result = await this.notificationService.sendToUser(userId, {
      title: 'HomeCart reminder',
      body: this.buildBody(items.map((item) => item.name)),
      url: this.buildReminderUrl(),
      tag: 'high-priority-reminder',
    });

    return {
      matchingItems: items.length,
      subscriptions: result.subscriptions,
      sent: result.sent,
      failed: result.failed,
      removed: result.removed,
      message:
        result.subscriptions === 0
          ? 'No push subscriptions found for this user.'
          : undefined,
    };
  }

  private buildBody(itemNames: string[]): string {
    const uniqueNames = [...new Set(itemNames)];
    const visibleNames = uniqueNames.slice(0, 3);
    const remainingCount = uniqueNames.length - visibleNames.length;
    const base = visibleNames.join(', ');

    if (remainingCount > 0) {
      return `High-priority items: ${base} and ${remainingCount} more`;
    }

    return `High-priority items: ${base}`;
  }

  private buildReminderUrl(): string {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    return `${frontendUrl}/households`;
  }
}
