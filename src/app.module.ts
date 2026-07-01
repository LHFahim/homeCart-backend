import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { AdminModule } from './admin/admin.module';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { ProfileModule } from './profile/profile.module';
import { UserModule } from './user/user.module';
import { HouseholdModule } from './household/household.module';
import { CartModule } from './cart/cart.module';

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
    UserModule,
    AuthModule,

    AdminModule,

    ProfileModule,

    HouseholdModule,

    CartModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
