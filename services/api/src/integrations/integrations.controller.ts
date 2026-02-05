import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { GitHubService } from './github/github.service';
import { JiraService } from './jira/jira.service';
import { SlackService } from './slack/slack.service';
import { AIService } from './ai/ai.service';
import {
  ValidateGitHubPatDto,
  ValidateJiraCredentialsDto,
  ValidateSlackWebhookDto,
  ValidateAiApiKeyDto,
} from './dto';

@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly githubService: GitHubService,
    private readonly jiraService: JiraService,
    private readonly slackService: SlackService,
    private readonly aiService: AIService,
  ) {}

  // GitHub
  @Post('github/validate')
  @HttpCode(HttpStatus.OK)
  async validateGitHubPat(@Body() dto: ValidateGitHubPatDto) {
    return this.githubService.validatePat(dto.pat);
  }

  @Post('github/repositories')
  @HttpCode(HttpStatus.OK)
  async listGitHubRepositories(@Body() dto: ValidateGitHubPatDto) {
    const repositories = await this.githubService.listRepositories(dto.pat);
    return repositories.map((repo) => ({
      owner: repo.owner,
      name: repo.name,
      fullName: repo.full_name,
    }));
  }

  // Jira
  @Post('jira/validate')
  @HttpCode(HttpStatus.OK)
  async validateJiraCredentials(@Body() dto: ValidateJiraCredentialsDto) {
    return this.jiraService.validateCredentials({
      host: dto.host,
      email: dto.email,
      apiToken: dto.apiToken,
    });
  }

  // Slack
  @Post('slack/validate')
  @HttpCode(HttpStatus.OK)
  async validateSlackWebhook(@Body() dto: ValidateSlackWebhookDto) {
    const valid = await this.slackService.validateWebhook(dto.webhookUrl);
    return { valid };
  }

  @Post('slack/test')
  @HttpCode(HttpStatus.OK)
  async testSlackWebhook(@Body() dto: ValidateSlackWebhookDto) {
    await this.slackService.sendText(
      dto.webhookUrl,
      '🎉 SprintGhost 연동 테스트 메시지입니다!',
    );
  }

  // AI
  @Post('ai/validate')
  @HttpCode(HttpStatus.OK)
  async validateAiApiKey(@Body() dto: ValidateAiApiKeyDto) {
    const valid = await this.aiService.validateApiKey(dto.provider, dto.apiKey);
    return { valid };
  }
}
