import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const BYPASS_KEY = 'PUBLIC';

export const isPubliclyAccessible = (context: ExecutionContext, reflector: Reflector): boolean => {
	return reflector.get<boolean>(BYPASS_KEY, context.getHandler());
};

export const Public = () => {
	return SetMetadata(BYPASS_KEY, true);
};
