import { modelOptions } from '@typegoose/typegoose';

export const Model = (
  collection: string,
  timestamps: boolean,
  discriminatorKey: string | undefined = undefined,
) => {
  return modelOptions({
    schemaOptions: {
      discriminatorKey,
      collection,
      timestamps,
      toJSON: {
        virtuals: true,
        getters: true,
        transform: (_, ret) => {
          ret.id = ret._id?.toString();
          delete ret._id;
          delete ret.__v;
          return ret;
        },
      },
      toObject: {
        virtuals: true,
        getters: true,
        transform: (_, ret) => {
          ret.id = ret._id?.toString();
          delete ret._id;
          delete ret.__v;
          return ret;
        },
      },
    },
  });
};
