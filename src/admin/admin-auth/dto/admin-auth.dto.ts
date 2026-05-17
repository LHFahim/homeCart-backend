import { ApiProperty, PickType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { AuthProvider } from 'src/common/enum/auth.enum';
import { UserEntity } from '../../../user/entities/user.entity';

export class AdminRegisterDto extends PickType(UserEntity, [
  'firstName',
  'lastName',

  'phone',
  'avatarURL',
  'email',
]) {
  @Expose()
  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  role: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ required: false, readOnly: true })
  authProvider: AuthProvider;
}
