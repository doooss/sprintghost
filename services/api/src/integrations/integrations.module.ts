import { Module } from '@nestjs/common';
import { GitHubModule } from './github/github.module';
import { JiraModule } from './jira/jira.module';
import { SlackModule } from './slack/slack.module';
import { AIModule } from './ai/ai.module';
import { IntegrationsController } from './integrations.controller';

@Module({
  imports: [GitHubModule, JiraModule, SlackModule, AIModule],
  controllers: [IntegrationsController],
  exports: [GitHubModule, JiraModule, SlackModule, AIModule],
})
export class IntegrationsModule {}
