import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class ValidateAiApiKeyDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['openai', 'anthropic', 'google'])
  provider: 'openai' | 'anthropic' | 'google';

  @IsString()
  @IsNotEmpty()
  apiKey: string;
}
