import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Serialize } from 'libraries/serializer/serializer.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Routes } from 'src/common/constant/routes';
import { ResourceId } from 'src/common/decorator/params.decorator';
import { UserId } from 'src/common/decorator/user.decorator';
import { APIVersions } from 'src/common/enum/api-versions.enum';
import { ControllersEnum } from 'src/common/enum/controllers.enum';
import { CartService } from './cart.service';
import {
  CartPaginatedDto,
  CartQueryDto,
  CreateCartDto,
  UpdateCartDto,
} from './dto/cart.dto';
import { CreateCartItemDto, UpdateCartItemDto } from './dto/cartItem.dto';

@ApiTags('Carts')
@Serialize()
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: ControllersEnum.Carts, version: APIVersions.V1 })
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post(Routes[ControllersEnum.Carts].create)
  create(@UserId() userId: string, @Body() body: CreateCartDto) {
    return this.cartService.create(userId, body);
  }

  @ApiResponse({
    type: CartPaginatedDto,
  })
  @Get(Routes[ControllersEnum.Carts].findAll)
  findAll(
    @UserId() userId: string,
    @Query() query: CartQueryDto,
  ): Promise<CartPaginatedDto> {
    console.log('inside findAll controller');
    return this.cartService.findAll(userId, query);
  }

  @Get(Routes[ControllersEnum.Carts].findOne)
  findOne(@UserId() userId: string, @ResourceId() id: string) {
    return this.cartService.findOne(userId, id);
  }

  @Patch(Routes[ControllersEnum.Carts].updateOne)
  update(
    @UserId() userId: string,
    @ResourceId() id: string,
    @Body() body: UpdateCartDto,
  ) {
    return this.cartService.update(userId, id, body);
  }

  @Delete(Routes[ControllersEnum.Carts].deleteOne)
  remove(@UserId() userId: string, @ResourceId() id: string) {
    return this.cartService.remove(userId, id);
  }

  @Post(Routes[ControllersEnum.Carts].createItem)
  createItem(
    @UserId() userId: string,
    @ResourceId() cartId: string,
    @Body() body: CreateCartItemDto,
  ) {
    return this.cartService.createItem(userId, cartId, body);
  }

  @Get(Routes[ControllersEnum.Carts].findAllItems)
  findAllItems(@UserId() userId: string, @ResourceId() cartId: string) {
    return this.cartService.findAllItems(userId, cartId);
  }

  @Get(Routes[ControllersEnum.Carts].findOneItem)
  findOneItem(
    @UserId() userId: string,
    @ResourceId() cartId: string,
    @ResourceId('itemId') itemId: string,
  ) {
    return this.cartService.findOneItem(userId, cartId, itemId);
  }

  @Patch(Routes[ControllersEnum.Carts].updateOneItem)
  updateItem(
    @UserId() userId: string,
    @ResourceId() cartId: string,
    @ResourceId('itemId') itemId: string,
    @Body() body: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(userId, cartId, itemId, body);
  }

  @Delete(Routes[ControllersEnum.Carts].deleteOneItem)
  removeItem(
    @UserId() userId: string,
    @ResourceId() cartId: string,
    @ResourceId('itemId') itemId: string,
  ) {
    return this.cartService.removeItem(userId, cartId, itemId);
  }
}
