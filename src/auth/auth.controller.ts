import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Serialize } from 'libraries/serializer/serializer.decorator';
import { Routes } from 'src/common/constant/routes';
import { APIVersions } from 'src/common/enum/api-versions.enum';
import { ControllersEnum } from 'src/common/enum/controllers.enum';
import { AuthService } from './auth.service';
import {
  AuthResponseDto,
  LoginDto,
  RefreshTokenDto,
  RegisterByEmailDto,
} from './dto/auth.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('Auth')
@Serialize()
@Controller({ path: ControllersEnum.Auth, version: APIVersions.V1 })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({
    type: AuthResponseDto,
  })
  @UseGuards(LocalAuthGuard)
  @Post(Routes[ControllersEnum.Auth].login)
  async login(@Body() body: LoginDto, @Request() request: any) {
    return await this.authService.login(body, request);
  }

  @ApiResponse({
    type: AuthResponseDto,
  })
  @Post(Routes[ControllersEnum.Auth].registerByEmail)
  registerByEmail(@Body() body: RegisterByEmailDto): Promise<AuthResponseDto> {
    return this.authService.registerByEmail(body);
  }

  @ApiResponse({
    type: AuthResponseDto,
  })
  @Post(Routes[ControllersEnum.Auth].refreshJwtToken)
  refreshJwtToken(@Body() body: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshJwtToken(body);
  }
}
