import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Serialize } from 'libraries/serializer/serializer.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Routes } from 'src/common/constant/routes';
import { UserId } from 'src/common/decorator/user.decorator';
import { APIVersions } from 'src/common/enum/api-versions.enum';
import { ControllersEnum } from 'src/common/enum/controllers.enum';

import {
  SubscribePushDto,
  TestPushDto,
  UnsubscribePushDto,
} from './dto/push-subscription.dto';
import {
  HighPriorityReminderService,
  HighPriorityReminderSummary,
} from './high-priority-reminder.service';
import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@Serialize()
@Controller({
  path: ControllersEnum.Notifications,
  version: APIVersions.V1,
})
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly highPriorityReminderService: HighPriorityReminderService,
  ) {}

  @Get(Routes[ControllersEnum.Notifications].publicKey)
  @ApiOperation({
    summary: 'Get the public VAPID key',
  })
  getPublicKey() {
    return {
      publicKey: this.notificationService.getPublicKey(),
    };
  }

  @Post(Routes[ControllersEnum.Notifications].subscribe)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Save or update a browser push subscription',
  })
  subscribe(
    @UserId() userId: string,
    @Body() body: SubscribePushDto,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.notificationService.subscribe(userId, body, userAgent);
  }

  @Delete(Routes[ControllersEnum.Notifications].unsubscribe)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Remove a browser push subscription',
  })
  unsubscribe(@UserId() userId: string, @Body() body: UnsubscribePushDto) {
    return this.notificationService.unsubscribe(userId, body.endpoint);
  }

  @Post(Routes[ControllersEnum.Notifications].test)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Send a test push notification to the current user',
  })
  sendTestNotification(@UserId() userId: string, @Body() body: TestPushDto) {
    return this.notificationService.sendToUser(userId, {
      title: body.title ?? 'HomeCart',
      body: body.body ?? 'Your browser push notifications are working.',
      url: body.url ?? process.env.FRONTEND_URL ?? 'http://localhost:3000',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'homecart-test',
    });
  }

  @Post(Routes[ControllersEnum.Notifications].highPriorityReminderTest)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Send a high-priority cart item reminder test push for the current user',
  })
  sendHighPriorityReminderTest(@UserId() userId: string) {
    return this.highPriorityReminderService.sendHighPriorityReminderToUser(
      userId,
    );
  }

  @Post(Routes[ControllersEnum.Notifications].highPriorityRemindersInternal)
  @ApiOperation({
    summary:
      'Internal endpoint for deployment scheduler to trigger high-priority reminders',
  })
  @ApiHeader({
    name: 'x-cron-secret',
    required: true,
    description:
      'Internal scheduler secret from CRON_SECRET environment variable',
  })
  sendInternalHighPriorityReminders(
    @Headers('x-cron-secret') cronSecret?: string,
  ): Promise<HighPriorityReminderSummary> {
    const configuredSecret = process.env.CRON_SECRET;

    if (!configuredSecret || !cronSecret || cronSecret !== configuredSecret) {
      throw new ForbiddenException('Forbidden');
    }

    return this.highPriorityReminderService.sendHighPriorityRemindersWithOverlapProtection();
  }
}
