import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Serialize } from 'libraries/serializer/serializer.decorator';
import { AuthService } from 'src/auth/auth.service';
import {
  AuthResponseDto,
  ChangePasswordDto,
  LoginDto,
  ResetPasswordDto,
  ResetPasswordSendCodeDto,
  VerifyEmailDto,
} from 'src/auth/dto/auth.dto';
import { Routes } from 'src/common/constant/routes';
import { UserId } from 'src/common/decorator/user.decorator';
import { APIVersions } from 'src/common/enum/api-versions.enum';
import { AuthProvider } from 'src/common/enum/auth.enum';
import { ControllersEnum } from 'src/common/enum/controllers.enum';
import { ConfigService } from 'src/config/config.service';
import { AdminAuthService } from './admin-auth.service';
import { AdminJwtAuthGuard } from './admin-guards/admin-jwt-auth.guard';
import { AdminRegisterDto } from './dto/admin-auth.dto';

@ApiTags('Admin -> auth')
@Serialize()
@Controller({ path: ControllersEnum.AdminAuth, version: APIVersions.V1 })
export class AdminAuthController {
  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post(Routes[ControllersEnum.AdminAuth].registerByEmail)
  async register(@Body() dto: AdminRegisterDto) {
    return this.adminAuthService.register({
      ...dto,
      authProvider: AuthProvider.EMAIL,
    });
  }

  @ApiOkResponse({ type: AuthResponseDto })
  @ApiBody({ type: LoginDto })
  @HttpCode(200)
  @Post(Routes[ControllersEnum.AdminAuth].login)
  async login(@Body() dto: LoginDto) {
    return this.adminAuthService.login(dto);
  }

  @ApiBearerAuth()
  @UseGuards(AdminJwtAuthGuard)
  @Patch(Routes[ControllersEnum.AdminAuth].changePassword)
  async changePassword(
    @UserId() userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto);
  }

  @Patch(Routes[ControllersEnum.AdminAuth].resetPassword)
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.adminAuthService.resetPassword(body);
  }

  @Post(Routes[ControllersEnum.AdminAuth].resetPasswordSendCode)
  async resetPasswordSendCode(@Body() body: ResetPasswordSendCodeDto) {
    return this.adminAuthService.resetPasswordSendCode(body);
  }

  @Get(Routes[ControllersEnum.AdminAuth].verifyEmailPublic)
  async verifyEmailPublic(@Query() dto: VerifyEmailDto, @Res() res: any) {
    await this.authService.verifyEmailPublic(dto, res);

    res.redirect(`${this.configService.FRONTEND_URL}`);
  }
}
