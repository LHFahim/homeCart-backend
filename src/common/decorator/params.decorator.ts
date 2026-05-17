import { Param } from '@nestjs/common';

export const ResourceId = (name = 'id') => Param(name);
