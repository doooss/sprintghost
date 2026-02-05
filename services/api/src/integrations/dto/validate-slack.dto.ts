import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class ValidateSlackWebhookDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  webhookUrl: string;
}
