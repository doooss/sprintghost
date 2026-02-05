import {
  Controller,
  Post,
  Body,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ProjectKeyGuard } from './guards/project-key.guard';
import { CurrentProject } from './decorators/project.decorator';
import { WebhookService, GitHubEventType, GitHubWebhookPayload } from './webhook.service';
import { Project } from '../database/schema';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  @Post('github')
  @UseGuards(ProjectKeyGuard)
  @HttpCode(HttpStatus.OK)
  async handleGitHub(
    @Headers('x-github-event') eventType: GitHubEventType,
    @Headers('x-github-delivery') deliveryId: string,
    @Body() payload: GitHubWebhookPayload,
    @CurrentProject() project: Project,
  ) {
    this.logger.log(`Received GitHub webhook: ${eventType} (${deliveryId})`);

    const result = await this.webhookService.handleGitHubWebhook(
      project,
      eventType,
      payload,
    );

    return {
      success: result.processed,
      message: result.message,
      deliveryId,
    };
  }

  @Post('health')
  @HttpCode(HttpStatus.OK)
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
