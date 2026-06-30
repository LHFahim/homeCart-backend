import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Serialize } from 'libraries/serializer/serializer.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Routes } from 'src/common/constant/routes';
import { ResourceId } from 'src/common/decorator/params.decorator';
import { UserId } from 'src/common/decorator/user.decorator';
import { APIVersions } from 'src/common/enum/api-versions.enum';
import { ControllersEnum } from 'src/common/enum/controllers.enum';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { HouseholdQueryDto } from './dto/household.dto';
import { UpdateHouseholdDto } from './dto/update-household.dto';
import { HouseholdService } from './household.service';

@ApiTags('Households')
@Serialize()
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: ControllersEnum.Households, version: APIVersions.V1 })
export class HouseholdController {
  constructor(private readonly householdService: HouseholdService) {}

  @Post(Routes[ControllersEnum.Households].create)
  create(@UserId() userId: string, @Body() body: CreateHouseholdDto) {
    return this.householdService.create(userId, body);
  }

  @Get(Routes[ControllersEnum.Households].findAll)
  findAll(@UserId() userId: string, @Query() query: HouseholdQueryDto) {
    return this.householdService.findAll(userId, query);
  }

  @Get(Routes[ControllersEnum.Households].findOne)
  findOne(@UserId() userId: string, @ResourceId() id: string) {
    return this.householdService.findOne(userId, id);
  }

  @Patch(Routes[ControllersEnum.Households].updateOne)
  update(
    @UserId() userId: string,
    @ResourceId() id: string,
    @Body() body: UpdateHouseholdDto,
  ) {
    return this.householdService.update(userId, id, body);
  }

  @Delete(Routes[ControllersEnum.Households].deleteOne)
  remove(@UserId() userId: string, @ResourceId() id: string) {
    return this.householdService.remove(userId, id);
  }
}
