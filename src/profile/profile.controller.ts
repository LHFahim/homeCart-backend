import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Serialize } from 'libraries/serializer/serializer.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Routes } from 'src/common/constant/routes';
import { UserId } from 'src/common/decorator/user.decorator';
import { APIVersions } from 'src/common/enum/api-versions.enum';
import { ControllersEnum } from 'src/common/enum/controllers.enum';
import { ProfileService } from './profile.service';

@ApiTags('Profile')
@Serialize()
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: ControllersEnum.Profile, version: APIVersions.V1 })
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(Routes[ControllersEnum.Profile].me)
  findMyProfile(@UserId() userId: string) {
    return this.profileService.findMyProfile(userId);
  }


}
