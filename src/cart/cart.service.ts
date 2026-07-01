import { Injectable, NotFoundException } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { SerializeService } from 'libraries/serializer/serialize';
import { InjectModel } from 'nestjs-typegoose';
import {
  CartDto,
  CartPaginatedDto,
  CartQueryDto,
  CreateCartDto,
  UpdateCartDto,
} from './dto/cart.dto';
import { CreateCartItemDto, UpdateCartItemDto } from './dto/cartItem.dto';
import {
  CartEntity,
  CartItemEntity,
  CartItemPriorityEnum,
  CartStatusEnum,
} from './entities/cart.entity';
import { HouseholdEntity } from 'src/household/entities/household.entity';

@Injectable()
export class CartService extends SerializeService<CartEntity> {
  constructor(
    @InjectModel(CartEntity)
    private readonly cartModel: ReturnModelType<typeof CartEntity>,
    @InjectModel(CartItemEntity)
    private readonly cartItemModel: ReturnModelType<typeof CartItemEntity>,
    @InjectModel(HouseholdEntity)
    private readonly householdModel: ReturnModelType<typeof HouseholdEntity>,
  ) {
    super(CartEntity);
  }

  private async getAccessibleHouseholdIds(userId: string) {
    const households = await this.householdModel
      .find({
        isDeleted: false,
        $or: [{ createdBy: userId }, { 'members.userId': userId }],
      })
      .select({ _id: 1 });

    return households.map((household) => household._id);
  }

  private async getAccessibleCart(userId: string, cartId: string) {
    const householdIds = await this.getAccessibleHouseholdIds(userId);

    const cart = await this.cartModel.findOne({
      _id: cartId,
      isDeleted: false,
      householdId: { $in: householdIds },
    });

    if (!cart) throw new NotFoundException('Cart not found');

    return cart;
  }

  async create(userId: string, body: CreateCartDto) {
    const householdIds = await this.getAccessibleHouseholdIds(userId);

    if (
      !householdIds.some(
        (householdId) => householdId.toString() === body.householdId.toString(),
      )
    ) {
      throw new NotFoundException('Cart not found');
    }

    const cart = await this.cartModel.create({
      ...body,
      status: CartStatusEnum.ACTIVE,
      completedAt: null,
      isActive: true,
      isDeleted: false,
    });

    return this.toJSON(cart, CartDto);
  }

  async findAll(userId: string, query: CartQueryDto): Promise<CartPaginatedDto> {
    const householdIds = await this.getAccessibleHouseholdIds(userId);
    const accessibleHouseholdIds = householdIds.map((householdId) =>
      householdId.toString(),
    );

    if (!accessibleHouseholdIds.length) {
      return {
        items: [],
        pagination: {
          total: 0,
          current: query.page,
          previous: 1,
          next: 1,
        },
      };
    }

    if (
      query.householdId &&
      !accessibleHouseholdIds.includes(query.householdId)
    ) {
      return {
        items: [],
        pagination: {
          total: 0,
          current: query.page,
          previous: 1,
          next: 1,
        },
      };
    }

    const filter = {
      isDeleted: false,
      householdId: query.householdId
        ? query.householdId
        : { $in: accessibleHouseholdIds },

      ...(query.search
        ? { name: { $regex: query.search, $options: 'i' } }
        : {}),
    };

    const docs = await this.cartModel
      .find(filter)
      .sort({ [query.sortBy]: query.sort })
      .limit(query.pageSize)
      .skip((query.page - 1) * query.pageSize);

    const docsCount = await this.cartModel.countDocuments(filter);

    return {
      items: this.toJSONs(docs, CartDto),
      pagination: {
        total: docsCount,
        current: query.page,
        previous: query.page === 1 ? 1 : query.page - 1,
        next:
          docsCount > query.page * query.pageSize ? query.page + 1 : query.page,
      },
    };
  }

  async findOne(userId: string, id: string) {
    const cart = await this.getAccessibleCart(userId, id);

    return this.toJSONe(cart);
  }

  async update(userId: string, id: string, body: UpdateCartDto) {
    const cart = await this.cartModel.findOneAndUpdate(
      {
        _id: id,
        isDeleted: false,
        householdId: { $in: await this.getAccessibleHouseholdIds(userId) },
      },
      { ...body },
      { new: true },
    );

    if (!cart) throw new NotFoundException('Cart not found');

    return this.toJSONe(cart);
  }

  async remove(userId: string, id: string) {
    const cart = await this.cartModel.findOneAndUpdate(
      {
        _id: id,
        isDeleted: false,
        householdId: { $in: await this.getAccessibleHouseholdIds(userId) },
      },
      { isActive: false, isDeleted: true, status: CartStatusEnum.CANCELLED },
      { new: true },
    );

    if (!cart) throw new NotFoundException('Cart not found');

    return this.toJSONe(cart);
  }

  async createItem(userId: string, cartId: string, body: CreateCartItemDto) {
    const cart = await this.getAccessibleCart(userId, cartId);

    const item = await this.cartItemModel.create({
      ...body,
      cartId,
      householdId: cart.householdId,
      addedBy: userId,
      quantity: body.quantity ?? 1,
      priority: body.priority ?? CartItemPriorityEnum.NORMAL,
      isPurchased: false,
      purchasedBy: null,
      purchasedAt: null,
      isActive: true,
      isDeleted: false,
    });

    return this.toJSON(item, CartItemEntity);
  }

  async findAllItems(userId: string, cartId: string) {
    await this.getAccessibleCart(userId, cartId);

    const docs = await this.cartItemModel
      .find({ cartId, isDeleted: false })
      .sort({ createdAt: -1 });

    return this.toJSONs(docs, CartItemEntity);
  }

  async findOneItem(userId: string, cartId: string, itemId: string) {
    await this.getAccessibleCart(userId, cartId);

    const item = await this.cartItemModel.findOne({
      _id: itemId,
      cartId,
      isDeleted: false,
    });

    if (!item) throw new NotFoundException('Cart item not found');

    return this.toJSON(item, CartItemEntity);
  }

  async updateItem(
    userId: string,
    cartId: string,
    itemId: string,
    body: UpdateCartItemDto,
  ) {
    await this.getAccessibleCart(userId, cartId);

    const item = await this.cartItemModel.findOneAndUpdate(
      { _id: itemId, cartId, isDeleted: false },
      { ...body },
      { new: true },
    );

    if (!item) throw new NotFoundException('Cart item not found');

    return this.toJSON(item, CartItemEntity);
  }

  async removeItem(userId: string, cartId: string, itemId: string) {
    await this.getAccessibleCart(userId, cartId);

    const item = await this.cartItemModel.findOneAndUpdate(
      { _id: itemId, cartId, isDeleted: false },
      { isActive: false, isDeleted: true },
      { new: true },
    );

    if (!item) throw new NotFoundException('Cart item not found');

    return this.toJSON(item, CartItemEntity);
  }
}
