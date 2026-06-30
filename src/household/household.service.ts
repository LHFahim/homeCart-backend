import { Injectable, NotFoundException } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { SerializeService } from 'libraries/serializer/serialize';
import { InjectModel } from 'nestjs-typegoose';
import { CreateHouseholdDto } from './dto/create-household.dto';
import {
  HouseholdDto,
  HouseholdPaginatedDto,
  HouseholdQueryDto,
} from './dto/household.dto';
import { UpdateHouseholdDto } from './dto/update-household.dto';
import {
  HouseholdEntity,
  HouseholdMemberRoleEnum,
} from './entities/household.entity';

@Injectable()
export class HouseholdService extends SerializeService<HouseholdEntity> {
  constructor(
    @InjectModel(HouseholdEntity)
    private readonly householdModel: ReturnModelType<typeof HouseholdEntity>,
  ) {
    super(HouseholdEntity);
  }

  async create(
    userId: string,
    body: CreateHouseholdDto,
  ): Promise<HouseholdDto> {
    console.log('body --->', body);
    const household = await this.householdModel.create({
      ...body,
      settings: {
        currency: 'AUD',
        timezone: 'Australia/Melbourne',
        weekStartsOn: 'MONDAY',
        ...body.settings,
      },
      createdBy: userId,
      members: body.members.map((memberId) => ({
        userId: memberId,
        displayName: '',
        role: HouseholdMemberRoleEnum.MEMBER,
      })),
    });

    return this.toJSON(household, HouseholdDto);
  }

  async findAll(
    userId: string,
    query: HouseholdQueryDto,
  ): Promise<HouseholdPaginatedDto> {
    const filter = {
      createdBy: userId,
      ...(query.search
        ? { name: { $regex: query.search, $options: 'i' } }
        : {}),
    };

    // const sortBy = query.sortBy || 'createdAt';
    // const sort = query.sort || 'desc';
    // const page = query.page || 1;
    // const pageSize = query.pageSize || 20;

    const docs = await this.householdModel
      .find(filter)
      .sort({ [query.sortBy]: query.sort })
      .limit(query.pageSize)
      .skip((query.page - 1) * query.pageSize);

    const docsCount = await this.householdModel.countDocuments(filter);

    return {
      items: this.toJSONs(docs, HouseholdDto),
      pagination: {
        total: docsCount,
        current: query.page,
        previous: query.page === 1 ? 1 : query.page - 1,
        next:
          docsCount > query.page * query.pageSize ? query.page + 1 : query.page,
      },
    };
  }

  async findOne(userId: string, id: string): Promise<HouseholdDto> {
    const household = await this.householdModel.findOne({
      _id: id,
      createdBy: userId,
    });

    if (!household) throw new NotFoundException('Household not found');

    return this.toJSON(household, HouseholdDto);
  }

  async update(
    userId: string,
    id: string,
    body: UpdateHouseholdDto,
  ): Promise<HouseholdDto> {
    const household = await this.householdModel.findOneAndUpdate(
      {
        _id: id,
        createdBy: userId,
      },
      { ...body },
      { new: true },
    );

    if (!household) throw new NotFoundException('Household not found');

    return this.toJSON(household, HouseholdDto);
  }

  async remove(userId: string, id: string): Promise<HouseholdDto> {
    const household = await this.householdModel.findOneAndUpdate(
      {
        _id: id,
        createdBy: userId,
      },
      { isDeleted: true },
      { new: true },
    );

    if (!household) throw new NotFoundException('Household not found');

    return this.toJSON(household, HouseholdDto);
  }
}
