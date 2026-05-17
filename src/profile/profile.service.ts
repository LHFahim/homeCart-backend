import { Injectable, NotFoundException } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { SerializeService } from 'libraries/serializer/serialize';
import { InjectModel } from 'nestjs-typegoose';
import { UserEntity } from 'src/user/entities/user.entity';
import { ProfileDto } from './dto/profile.dto';

@Injectable()
export class ProfileService extends SerializeService<UserEntity> {
  constructor(
    @InjectModel(UserEntity)
    private readonly userModel: ReturnModelType<typeof UserEntity>,
  ) {
    super(UserEntity);
  }

  async findMyProfile(userId: string) {
    const doc = await this.userModel.findById(userId);

    if (!doc) throw new NotFoundException('User not found');

    return this.toJSON(doc, ProfileDto);
  }
}
