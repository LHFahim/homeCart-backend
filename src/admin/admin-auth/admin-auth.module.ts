import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypegooseModule } from 'nestjs-typegoose';
import { AuthService } from 'src/auth/auth.service';
import { ConfigService } from 'src/config/config.service';
import { UserModule } from 'src/user/user.module';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';

@Global()
@Module({
  controllers: [AdminAuthController],
  providers: [AdminAuthService, AuthService],
  imports: [
    TypegooseModule.forFeature([]),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.JWT_SECRET,
        global: true,
        signOptions: { expiresIn: '300s' },
      }),
      inject: [ConfigService],
    }),
    UserModule,
  ],
  exports: [AdminAuthService],
})
export class AdminAuthModule {}
