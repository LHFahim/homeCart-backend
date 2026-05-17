import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Serialize } from 'libraries/serializer/serializer.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Routes } from 'src/common/constant/routes';
import { ResourceId } from 'src/common/decorator/params.decorator';
import { UserId } from 'src/common/decorator/user.decorator';
import { APIVersions } from 'src/common/enum/api-versions.enum';
import { ControllersEnum } from 'src/common/enum/controllers.enum';
import {
  UpdateUserDto,
  UserDto,
  UserPaginatedDto,
  UserQueryDto,
} from './dto/user.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@Serialize()
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: ControllersEnum.Users, version: APIVersions.V1 })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiResponse({
    type: UserPaginatedDto,
  })
  @Get(Routes[ControllersEnum.Users].findAll)
  findAll(
    @Request() request: any,
    @Query() query: UserQueryDto,
  ): Promise<UserPaginatedDto> {
    return this.userService.findAll(query);
  }

  @ApiResponse({
    type: UserDto,
  })
  @Get(Routes[ControllersEnum.Users].findOne)
  findOne(@ResourceId() id: string) {
    return this.userService.findUserById(id);
  }

  @ApiResponse({
    type: UserDto,
  })
  @Patch(Routes[ControllersEnum.Users].updateOne)
  update(
    @UserId() userId: string,
    @ResourceId() id: string,
    @Body() body: UpdateUserDto,
  ) {
    return this.userService.update(userId, id, body);
  }

  @ApiResponse({
    type: UserDto,
  })
  @Delete(Routes[ControllersEnum.Users].deleteOne)
  remove(@UserId() userId: string, @ResourceId() id: string) {
    return this.userService.remove(userId, id);
  }
}
