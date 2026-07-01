import { PartialType, PickType } from '@nestjs/swagger';
import { CartItemEntity } from '../entities/cart.entity';

export class CreateCartItemDto extends PickType(CartItemEntity, [
  'name',
  'quantity',
  'unit',
  'category',
  'image',
  'note',
  'estimatedPrice',
  'actualPrice',
  'assignedTo',
  'priority',
]) {}

export class UpdateCartItemDto extends PartialType(CreateCartItemDto) {}