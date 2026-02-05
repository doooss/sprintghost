import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { ProjectKeyGuard } from './guards/project-key.guard';
import { PROpenedHandler } from './handlers/pr-opened.handler';
import { PRMergedHandler } from './handlers/pr-merged.handler';
import { DODCheckHandler } from './handlers/dod-check.handler';
import { ProjectsModule } from '../projects/projects.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [ProjectsModule, IntegrationsModule],
  controllers: [WebhookController],
  providers: [
    WebhookService,
    ProjectKeyGuard,
    PROpenedHandler,
    PRMergedHandler,
    DODCheckHandler,
  ],
})
export class WebhookModule {}
