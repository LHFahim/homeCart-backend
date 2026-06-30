import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypegooseModule } from 'nestjs-typegoose';
import { HouseholdEntity } from './entities/household.entity';
import { HouseholdService } from './household.service';
import { HouseholdController } from './household.controller';

@Module({
  imports: [TypegooseModule.forFeature([HouseholdEntity])],
  controllers: [HouseholdController],
  providers: [HouseholdService, JwtService],
  exports: [HouseholdService],
})
export class HouseholdModule {}
