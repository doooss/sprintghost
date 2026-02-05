import { IsString, IsNotEmpty } from 'class-validator';

export class ValidateGitHubPatDto {
  @IsString()
  @IsNotEmpty()
  pat: string;
}
