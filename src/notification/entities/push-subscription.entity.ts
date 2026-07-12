import { ApiProperty } from '@nestjs/swagger';
import { Prop } from '@typegoose/typegoose';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Model } from 'libraries/mongodb/modelOptions';
import { Types } from 'mongoose';
import { DocumentWithTimeStamps } from 'src/common/classes/documentWithTimeStamps';

export class BrowserPushKeys {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    description: 'Browser public encryption key',
  })
  @Prop({
    required: true,
    trim: true,
  })
  p256dh: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    description: 'Browser push authentication secret',
  })
  @Prop({
    required: true,
    trim: true,
  })
  auth: string;
}

@Model('push-subscriptions', true)
export class PushSubscriptionEntity extends DocumentWithTimeStamps {
  @Expose()
  @IsMongoId()
  @Transform(({ value }) => value?.toString())
  @ApiProperty({
    required: true,
    type: String,
    description: 'User who owns the browser subscription',
  })
  @Prop({
    required: true,
    type: Types.ObjectId,
    index: true,
  })
  userId: Types.ObjectId;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    description: 'Unique push-service endpoint provided by the browser',
  })
  @Prop({
    required: true,
    type: String,
    trim: true,
    unique: true,
    index: true,
  })
  endpoint: string;

  @Expose()
  @ValidateNested()
  @Type(() => BrowserPushKeys)
  @ApiProperty({
    required: true,
    type: () => BrowserPushKeys,
  })
  @Prop({
    required: true,
    type: () => BrowserPushKeys,
    _id: false,
  })
  keys: BrowserPushKeys;

  @Expose()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    required: false,
    type: Number,
    nullable: true,
    default: null,
    description: 'Subscription expiration timestamp, when provided',
  })
  @Prop({
    required: false,
    type: Number,
    default: null,
  })
  expirationTime?: number | null;

  @Expose()
  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    type: String,
    nullable: true,
    default: null,
    description: 'Browser/device user-agent information',
  })
  @Prop({
    required: false,
    type: String,
    trim: true,
    default: null,
  })
  userAgent?: string | null;

  @Expose()
  @IsBoolean()
  @ApiProperty({
    required: true,
    type: Boolean,
    default: true,
  })
  @Prop({
    required: false,
    type: Boolean,
    default: true,
  })
  isActive: boolean;

  @Expose()
  @IsBoolean()
  @ApiProperty({
    required: true,
    type: Boolean,
    default: false,
  })
  @Prop({
    required: false,
    type: Boolean,
    default: false,
  })
  isDeleted: boolean;
}
