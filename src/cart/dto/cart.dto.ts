import { PartialType, PickType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CartEntity } from '../entities/cart.entity';

export class CreateCartDto extends PickType(CartEntity, [
  'name',
  'householdId',
]) {}

export class UpdateCartDto extends PartialType(CreateCartDto) {}

export class CartDto extends CartEntity {}

export class CartQueryDto extends PaginationQueryDto {
  @Expose()
  @IsMongoId()
  @IsOptional()
  @ApiProperty({ required: false, type: String })
  householdId?: string;
}

export class CartPaginatedDto {
  @Expose()
  items: CartDto[];

  @Expose()
  pagination: PaginationDto;
}
