import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class DodChecklistItemDto {
  @IsString()
  id!: string;

  @IsString()
  label!: string;

  @IsBoolean()
  @IsOptional()
  required?: boolean;
}

export class CreateProjectDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  // GitHub 설정
  @IsString()
  @IsOptional()
  githubPat?: string;

  @IsString()
  @IsOptional()
  githubOwner?: string;

  @IsString()
  @IsOptional()
  githubRepo?: string;

  // Jira 설정
  @IsString()
  @IsOptional()
  jiraHost?: string;

  @IsString()
  @IsOptional()
  jiraEmail?: string;

  @IsString()
  @IsOptional()
  jiraApiToken?: string;

  @IsString()
  @IsOptional()
  jiraProjectKey?: string;

  // Slack 설정
  @IsString()
  @IsOptional()
  slackWebhookUrl?: string;

  // AI 설정
  @IsString()
  @IsOptional()
  aiProvider?: 'openai' | 'anthropic' | 'google';

  @IsString()
  @IsOptional()
  aiApiKey?: string;

  @IsString()
  @IsOptional()
  aiModel?: string;

  // DOD 체크리스트
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DodChecklistItemDto)
  @IsOptional()
  dodChecklist?: DodChecklistItemDto[];

  // 데일리 스크럼 설정
  @IsBoolean()
  @IsOptional()
  dailyScrumEnabled?: boolean;

  @IsString()
  @IsOptional()
  dailyScrumCron?: string;

  @IsString()
  @IsOptional()
  dailyScrumTimezone?: string;

  // Jira 스프린트 Fallback 설정
  @IsBoolean()
  @IsOptional()
  jiraFallbackEnabled?: boolean;

  @IsNumber()
  @Min(1)
  @Max(30)
  @IsOptional()
  jiraFallbackDays?: number;
}
