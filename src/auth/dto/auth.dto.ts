import { ApiProperty, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { PanelType } from 'src/common/enum/auth.enum';
import { UserEntity } from 'src/user/entities/user.entity';

export class CreateAuthDto {}

export class UpdateAuthDto extends PartialType(CreateAuthDto) {}

export class LoginDto extends PickType(UserEntity, ['email']) {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true, default: 'stringst' })
  password: string;
}

export class RegisterByEmailDto extends PickType(UserEntity, [
  'firstName',
  'lastName',
  'email',
  'phone',
]) {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsEnum(PanelType)
  @ApiProperty({ required: false })
  panelType?: PanelType;
}

export class UserProfileDto extends OmitType(UserEntity, ['password']) {}
export class AuthResponseDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({})
  access_token: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({})
  refresh_token: string;

  @Expose()
  @IsNotEmpty()
  @Type(() => UserProfileDto)
  @ApiProperty({})
  user: UserProfileDto;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  refresh_token: string;
}

export class ChangePasswordDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  oldPassword: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  confirmNewPassword: string;
}

export class ResetPasswordDto extends PickType(UserEntity, ['email']) {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  confirmNewPassword: string;
}

export class ResetPasswordSendCodeDto extends PickType(UserEntity, ['email']) {}

export class ResetPasswordVerifyCodeDto extends PickType(UserEntity, [
  'email',
]) {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class VerifyEmailDto extends PickType(UserEntity, ['email']) {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  code: string;
}
