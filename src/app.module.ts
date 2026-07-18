import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypegooseModule } from 'nestjs-typegoose';
import { AdminModule } from './admin/admin.module';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { HouseholdModule } from './household/household.module';
import { NotificationModule } from './notification/notification.module';
import { ProfileModule } from './profile/profile.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TypegooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.MONGODB_URL,
      }),
      inject: [ConfigService],
    }),

    ConfigModule,
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,

    AdminModule,

    ProfileModule,

    HouseholdModule,

    CartModule,

    NotificationModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
