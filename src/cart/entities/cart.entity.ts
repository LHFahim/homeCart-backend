import { ApiProperty } from '@nestjs/swagger';
import { Prop } from '@typegoose/typegoose';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Model } from 'libraries/mongodb/modelOptions';
import { Types } from 'mongoose';
import { DocumentWithTimeStamps } from 'src/common/classes/documentWithTimeStamps';

export enum CartStatusEnum {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum CartItemPriorityEnum {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
}

@Model('carts', true)
export class CartEntity extends DocumentWithTimeStamps {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true, default: 'My Cart' })
  @Prop({ required: true, trim: true })
  name: string;

  @Expose()
  @IsMongoId()
  @Transform(({ value }) => value?.toString())
  @ApiProperty({ required: true, type: String })
  @Prop({ required: true, type: Types.ObjectId })
  householdId: Types.ObjectId;

  @Expose()
  @IsEnum(CartStatusEnum)
  @ApiProperty({
    required: true,
    enum: CartStatusEnum,
    default: CartStatusEnum.ACTIVE,
  })
  @Prop({
    required: true,
    enum: CartStatusEnum,
    default: CartStatusEnum.ACTIVE,
  })
  status: CartStatusEnum;

  @Expose()
  @IsOptional()
  @ApiProperty({ required: false, type: Date })
  @Prop({ required: false, type: Date, default: null })
  completedAt?: Date;

  @Prop({ required: false, type: Boolean, default: true })
  @Expose()
  isActive: boolean;

  @Prop({ required: false, type: Boolean, default: false })
  @Expose()
  isDeleted: boolean;
}

@Model('cartItems', true)
export class CartItemEntity extends DocumentWithTimeStamps {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  @Prop({ required: true, trim: true })
  name: string;

  @Expose()
  @IsMongoId()
  @Transform(({ value }) => value?.toString())
  @ApiProperty({ required: true, type: String })
  @Prop({ required: true, type: Types.ObjectId })
  cartId: Types.ObjectId;

  @Expose()
  @IsMongoId()
  @Transform(({ value }) => value?.toString())
  @ApiProperty({ required: true, type: String })
  @Prop({ required: true, type: Types.ObjectId })
  householdId: Types.ObjectId;

  @Expose()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ required: true, default: 1 })
  @Prop({ required: true, type: Number, default: 1 })
  quantity: number;

  @Expose()
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  @Prop({ required: false, trim: true })
  unit?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  @Prop({ required: false, trim: true })
  category?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  @Prop({ required: false, trim: true, default: '' })
  image?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  @Prop({ required: false, trim: true })
  note?: string;

  @Expose()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  @Prop({ required: false, type: Number, default: null })
  estimatedPrice?: number;

  @Expose()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  @Prop({ required: false, type: Number, default: null })
  actualPrice?: number;

  @Expose()
  @IsMongoId()
  @Transform(({ value }) => value?.toString())
  @ApiProperty({ required: true, type: String })
  @Prop({ required: true, type: Types.ObjectId })
  addedBy: Types.ObjectId;

  @Expose()
  @IsMongoId()
  @IsOptional()
  @Transform(({ value }) => value?.toString())
  @ApiProperty({ required: false, type: String })
  @Prop({ required: false, type: Types.ObjectId, default: null })
  assignedTo?: Types.ObjectId;

  @Expose()
  @IsBoolean()
  @ApiProperty({ required: true, default: false })
  @Prop({ required: true, type: Boolean, default: false })
  isPurchased: boolean;

  @Expose()
  @IsMongoId()
  @IsOptional()
  @Transform(({ value }) => value?.toString())
  @ApiProperty({ required: false, type: String })
  @Prop({ required: false, type: Types.ObjectId, default: null })
  purchasedBy?: Types.ObjectId;

  @Expose()
  @IsOptional()
  @ApiProperty({ required: false, type: Date })
  @Prop({ required: false, type: Date, default: null })
  purchasedAt?: Date;

  @Expose()
  @IsEnum(CartItemPriorityEnum)
  @ApiProperty({
    required: true,
    enum: CartItemPriorityEnum,
    default: CartItemPriorityEnum.NORMAL,
  })
  @Prop({
    required: true,
    enum: CartItemPriorityEnum,
    default: CartItemPriorityEnum.NORMAL,
  })
  priority: CartItemPriorityEnum;

  @Prop({ required: false, type: Boolean, default: true })
  @Expose()
  isActive: boolean;

  @Prop({ required: false, type: Boolean, default: false })
  @Expose()
  isDeleted: boolean;
}
