import { ApiProperty, PickType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsMongoId } from 'class-validator';
import { HouseholdEntity } from '../entities/household.entity';

export class CreateHouseholdDto extends PickType(HouseholdEntity, [
  'name',
  'settings',
]) {
  @Expose()
  @ApiProperty({
    required: true,
    type: [String],
    // example: ['64a37eefe5c2e4320dc5025c'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  members: string[];
}
