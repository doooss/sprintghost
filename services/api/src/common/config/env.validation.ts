import { plainToInstance, Type } from 'class-transformer';
import { IsString, IsOptional, IsNumber, validateSync, Min, Max } from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  ENCRYPTION_SECRET!: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  @Type(() => Number)
  PORT: number = 3000;

  @IsString()
  @IsOptional()
  NODE_ENV: string = 'development';

  @IsString()
  @IsOptional()
  DATABASE_PATH: string = './data/sprintghost.db';

  @IsString()
  @IsOptional()
  REDIS_URL: string = 'redis://localhost:6379';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.toString()}`);
  }

  return validatedConfig;
}
