import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { CommonModule } from './common/common.module';
import { ProjectsModule } from './projects/projects.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { WebhookModule } from './webhook/webhook.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { validate } from './common/config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
      validate,
    }),
    DatabaseModule,
    RedisModule,
    CommonModule,
    ProjectsModule,
    IntegrationsModule,
    WebhookModule,
    SchedulerModule,
    ActivityLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
