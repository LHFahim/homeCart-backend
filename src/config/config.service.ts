import { Injectable } from '@nestjs/common';
import { Env, Section, parseEnv } from 'atenv';
import { plainToClass } from 'class-transformer';
import { IsDefined, IsOptional, IsString, validateSync } from 'class-validator';

class AdminUserCredentials {
  @IsDefined({ message: 'Admin user email is required in .env file' })
  @Env('ADMIN_EMAIL')
  adminUserEmail: string;

  @IsDefined({
    message: 'Admin user password is required in .env file',
  })
  @Env('ADMIN_PASSWORD')
  adminUserPass: string;
}

@Injectable()
export class ConfigService {
  @Env('PORT')
  @IsDefined()
  @IsString({ message: 'INVALID PORT' })
  PORT: string;

  @IsDefined()
  @Env('MONGODB_URL')
  @IsString({ message: 'INVALID MONGODB URL' })
  MONGODB_URL: string;

  @IsDefined()
  @Env('JWT_SECRET')
  @IsString({ message: 'INVALID JWT' })
  JWT_SECRET: string;

  @IsDefined()
  @IsString()
  @Env('JWT_ACCESS_TOKEN_EXPIRES_IN')
  JWT_ACCESS_TOKEN_EXPIRES_IN: string;

  @IsDefined()
  @IsString()
  @Env('JWT_REFRESH_TOKEN_EXPIRES_IN')
  JWT_REFRESH_TOKEN_EXPIRES_IN: string;

  @IsOptional()
  @Env('FRONTEND_URL')
  FRONTEND_URL: string;

  @Section(() => AdminUserCredentials)
  adminUserCredential: AdminUserCredentials;
}

export const ParsedConfigs = parseEnv(ConfigService);

export const validate = (config: any) => {
  const validatedConfig = plainToClass(ConfigService, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
};
