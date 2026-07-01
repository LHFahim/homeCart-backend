import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { HouseholdEntity } from 'src/household/entities/household.entity';
import { CartEntity, CartItemEntity } from './entities/cart.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';

@Module({
  imports: [TypegooseModule.forFeature([CartEntity, CartItemEntity, HouseholdEntity])],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
