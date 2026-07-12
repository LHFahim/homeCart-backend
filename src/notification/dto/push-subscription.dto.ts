import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class PushSubscriptionKeysDto {
  @ApiProperty()
  @IsString()
  p256dh: string;

  @ApiProperty()
  @IsString()
  auth: string;
}

export class SubscribePushDto {
  @ApiProperty({
    required: true,
  })
  @IsUrl({
    require_protocol: true,
  })
  endpoint: string;

  @ApiPropertyOptional({
    nullable: true,
    example: null,
  })
  @IsOptional()
  @IsNumber()
  expirationTime?: number | null;

  @ApiProperty({
    type: PushSubscriptionKeysDto,
  })
  @ValidateNested()
  @Type(() => PushSubscriptionKeysDto)
  keys: PushSubscriptionKeysDto;
}

export class UnsubscribePushDto {
  @ApiProperty({
    required: true,
  })
  @IsUrl({
    require_protocol: true,
  })
  endpoint: string;
}

import { MaxLength } from 'class-validator';

export class TestPushDto {
  @ApiPropertyOptional({
    example: 'HomeCart',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({
    example: 'Browser notifications are working!',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  body?: string;

  @ApiPropertyOptional({
    required: false,
    description: 'Optional URL to open when the notification is clicked',
  })
  @IsOptional()
  @IsUrl({
    require_protocol: true,
  })
  url?: string;
}
