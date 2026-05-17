import { PartialType, PickType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UserEntity } from '../entities/user.entity';

export class UpdateUserDto extends PartialType(
  PickType(UserEntity, [
    'firstName',
    'lastName',
    'email',
    'phone',
    'avatarURL',
  ]),
) {}

export class UserDto extends UserEntity {}

export class UserQueryDto extends PaginationQueryDto {}
export class UserPaginatedDto {
  @Expose()
  items: UserDto[];

  @Expose()
  pagination: PaginationDto;
}
