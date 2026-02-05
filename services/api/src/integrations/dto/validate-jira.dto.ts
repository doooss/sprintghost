import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class ValidateJiraCredentialsDto {
  @IsString()
  @IsNotEmpty()
  host: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  apiToken: string;
}
