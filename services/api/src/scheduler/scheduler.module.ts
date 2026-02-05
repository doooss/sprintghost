import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { SchedulerService } from './scheduler.service';
import { DailyScrumProcessor, DAILY_SCRUM_QUEUE } from './processors/daily-scrum.processor';
import { ProjectsModule } from '../projects/projects.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>('REDIS_URL', 'redis://localhost:6379'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: DAILY_SCRUM_QUEUE,
    }),
    ProjectsModule,
    IntegrationsModule,
  ],
  providers: [SchedulerService, DailyScrumProcessor],
  exports: [SchedulerService],
})
export class SchedulerModule {}
