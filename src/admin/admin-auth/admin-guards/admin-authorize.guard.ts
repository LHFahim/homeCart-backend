import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ControllersEnum } from 'src/common/enum/controllers.enum';
import {
  PermissionsEnum,
  PermissionTypeEnum,
} from 'src/common/enum/permissions.enum';

export const AdminAuthorize = (
  permissionFor: PermissionsEnum,
  permissionType: PermissionTypeEnum,
) =>
  applyDecorators(
    SetMetadata('permissionFor', permissionFor),
    SetMetadata('permissionType', permissionType),
    UseGuards(AdminAuthorizeGuard),
  );

@Injectable()
export class AdminAuthorizeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const permissionFor = this.reflector.get<PermissionsEnum>(
      'permissionFor',
      context.getHandler(),
    );
    const permissionType = this.reflector.get<PermissionTypeEnum>(
      'permissionType',
      context.getHandler(),
    );

    if (
      // NOTE: here more paths can be checked to be authorized
      request.path.includes(`/api/v1/${ControllersEnum.Users}`)
    ) {
      // i can add business/validation logic here
    }

    return true;
  }
}
