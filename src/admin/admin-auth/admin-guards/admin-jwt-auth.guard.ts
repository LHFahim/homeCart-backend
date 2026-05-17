import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { isPubliclyAccessible } from 'src/auth/guards/public.decorator';
import { PanelType } from 'src/common/enum/auth.enum';

@Injectable()
export class AdminJwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext) {
    if (isPubliclyAccessible(context, this.reflector)) return true;

    const req = context.switchToHttp().getRequest();

    const token = req.headers.authorization;
    if (!token)
      throw new BadRequestException('Authorization Token is Required');

    const tokenSplit = token.split(' ').pop();
    if (!tokenSplit)
      throw new BadRequestException('Authorization Token is Required');

    const refreshTokenData = await this.jwtService.verifyAsync(tokenSplit);

    if (refreshTokenData.type !== 'refresh_token')
      throw new BadRequestException('Invalid refresh token');

    const user = await this.authService.getAuthUser(refreshTokenData.id);
    if (!user) throw new UnauthorizedException('Unauthorized');

    if (user.panelType !== PanelType.ADMIN)
      throw new BadRequestException('Route permission denied');

    if (!user.isActive) throw new HttpException('Account Inactive', 423);
    if (user.isDeleted) throw new HttpException('Account Deleted', 410);

    req.user = user;

    return true;
  }
}
