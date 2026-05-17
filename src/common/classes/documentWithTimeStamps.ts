import { ApiProperty } from '@nestjs/swagger';
import { Prop } from '@typegoose/typegoose';
import { Expose } from 'class-transformer';
import { Types } from 'mongoose';

export class Document {
  @ApiProperty({ name: 'id', type: String })
  @Expose({ name: 'id' })
  _id?: Types.ObjectId;
}

export class DocumentWithTimeStamps extends Document {
  @Prop({ required: false, type: Date })
  @Expose()
  public createdAt?: Date;

  @Prop({ required: false, type: Date })
  @Expose()
  public updatedAt?: Date;
}
