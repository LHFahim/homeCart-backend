import { Type } from '@nestjs/common';
import { DocumentType } from '@typegoose/typegoose';
import { plainToInstance } from 'class-transformer';

type AnyClass<T = any> = Type<T>;

export abstract class SerializeService<EntityModel> {
  protected constructor(private entityModel: Type<EntityModel>) {}

  protected toJSON<M, D>(doc: DocumentType<M> | M, dto: AnyClass<D>): D {
    return plainToInstance(dto, doc, {
      exposeUnsetFields: true,
      exposeDefaultValues: true,
      enableCircularCheck: true,
      excludeExtraneousValues: true,
    });
  }

  protected toJSONe(doc: DocumentType<EntityModel>): EntityModel {
    return plainToInstance(this.entityModel, doc, {
      exposeUnsetFields: true,
      exposeDefaultValues: true,
      enableCircularCheck: true,
      excludeExtraneousValues: true,
    });
  }

  protected toJSONs<M, D>(
    docs: DocumentType<M>[] | M[],
    dto: AnyClass<D>,
  ): D[] {
    return plainToInstance(dto, docs, {
      exposeUnsetFields: true,
      exposeDefaultValues: true,
      enableCircularCheck: true,
      excludeExtraneousValues: true,
    });
  }
}
