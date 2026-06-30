import { ApiProperty } from '@nestjs/swagger';
import { Prop } from '@typegoose/typegoose';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Model } from 'libraries/mongodb/modelOptions';
import { Types } from 'mongoose';
import { DocumentWithTimeStamps } from 'src/common/classes/documentWithTimeStamps';

export enum HouseholdMemberRoleEnum {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export class HouseholdSettings {
  @Expose()
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, default: 'AUD' })
  @Prop({ required: false, trim: true, default: 'AUD' })
  currency: string;

  @Expose()
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, default: 'Australia/Melbourne' })
  @Prop({ required: false, trim: true, default: 'Australia/Melbourne' })
  timezone: string;

  @Expose()
  @IsString()
  @IsOptional()
  @IsIn([
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ])
  @ApiProperty({ required: false, default: 'MONDAY' })
  @Prop({ required: false, trim: true, default: 'MONDAY' })
  weekStartsOn: string;
}

export class HouseholdMember {
  @Expose()
  @Transform(({ value }) => value?.toString())
  @IsMongoId()
  @ApiProperty({ required: true, type: String })
  @Prop({ required: true, type: Types.ObjectId })
  userId: Types.ObjectId;

  @Expose()
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  @Prop({ required: false, trim: true })
  displayName?: string;

  @Expose()
  @IsIn(Object.values(HouseholdMemberRoleEnum))
  @ApiProperty({
    required: true,
    enum: HouseholdMemberRoleEnum,
    default: HouseholdMemberRoleEnum.MEMBER,
  })
  @Prop({
    required: true,
    enum: HouseholdMemberRoleEnum,
    default: HouseholdMemberRoleEnum.MEMBER,
  })
  role: HouseholdMemberRoleEnum;

  @Expose()
  @ApiProperty({ required: false, type: Date })
  @Prop({ required: false, type: Date, default: Date.now })
  joinedAt: Date;
}

@Model('households', true)
export class HouseholdEntity extends DocumentWithTimeStamps {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true, default: 'Home' })
  @Prop({ required: true, trim: true })
  name: string;

  @Expose()
  @Transform(({ value }) => value?.toString())
  @ApiProperty({ required: true, type: String })
  @Prop({ required: true, type: Types.ObjectId })
  createdBy: Types.ObjectId;

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => HouseholdSettings)
  @ApiProperty({ required: false, type: HouseholdSettings })
  @Prop({
    required: false,
    type: () => HouseholdSettings,
    _id: false,
    default: () => ({
      currency: 'AUD',
      timezone: 'Australia/Melbourne',
      weekStartsOn: 'MONDAY',
    }),
  })
  settings: HouseholdSettings;

  @Expose()
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => HouseholdMember)
  @ApiProperty({ required: false, type: [HouseholdMember] })
  @Prop({
    required: false,
    type: () => [HouseholdMember],
    _id: false,
    default: [],
  })
  members: HouseholdMember[];

  @Prop({ required: false, type: Boolean, default: true })
  @Expose()
  isActive: boolean;

  @Prop({ required: false, type: Boolean, default: false })
  @Expose()
  isDeleted: boolean;
}
