import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { eq } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../database/database.module';
import { projects } from '../database/schema';
import { DAILY_SCRUM_QUEUE, DailyScrumJobData } from './processors/daily-scrum.processor';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectQueue(DAILY_SCRUM_QUEUE)
    private readonly dailyScrumQueue: Queue<DailyScrumJobData>,
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async onModuleInit() {
    // 앱 시작 시 모든 활성화된 스케줄 등록
    await this.syncSchedules();
  }

  /**
   * DB의 프로젝트 설정과 BullMQ 스케줄 동기화
   */
  async syncSchedules(): Promise<void> {
    this.logger.log('Syncing daily scrum schedules...');

    // 기존 반복 작업 모두 제거
    const repeatableJobs = await this.dailyScrumQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await this.dailyScrumQueue.removeRepeatableByKey(job.key);
    }

    // 활성화된 데일리 스크럼 프로젝트 조회
    const enabledProjects = await this.db
      .select()
      .from(projects)
      .where(eq(projects.dailyScrumEnabled, true));

    for (const project of enabledProjects) {
      if (project.dailyScrumCron) {
        await this.addDailyScrumSchedule(project.id, project.dailyScrumCron);
      }
    }

    this.logger.log(`Synced ${enabledProjects.length} daily scrum schedules`);
  }

  /**
   * 프로젝트의 데일리 스크럼 스케줄 추가
   */
  async addDailyScrumSchedule(projectId: string, cronExpression: string): Promise<void> {
    const jobId = `daily-scrum-${projectId}`;

    await this.dailyScrumQueue.add(
      jobId,
      { projectId },
      {
        repeat: {
          pattern: cronExpression,
        },
        jobId,
      },
    );

    this.logger.log(`Added daily scrum schedule for project ${projectId}: ${cronExpression}`);
  }

  /**
   * 프로젝트의 데일리 스크럼 스케줄 제거
   */
  async removeDailyScrumSchedule(projectId: string): Promise<void> {
    const jobId = `daily-scrum-${projectId}`;

    const repeatableJobs = await this.dailyScrumQueue.getRepeatableJobs();
    const job = repeatableJobs.find((j) => j.id === jobId);

    if (job) {
      await this.dailyScrumQueue.removeRepeatableByKey(job.key);
      this.logger.log(`Removed daily scrum schedule for project ${projectId}`);
    }
  }

  /**
   * 프로젝트의 스케줄 업데이트 (설정 변경 시 호출)
   */
  async updateDailyScrumSchedule(
    projectId: string,
    enabled: boolean,
    cronExpression?: string,
  ): Promise<void> {
    await this.removeDailyScrumSchedule(projectId);

    if (enabled && cronExpression) {
      await this.addDailyScrumSchedule(projectId, cronExpression);
    }
  }

  /**
   * 수동으로 데일리 스크럼 실행
   */
  async triggerDailyScrum(projectId: string): Promise<void> {
    await this.dailyScrumQueue.add(
      `manual-daily-scrum-${projectId}-${Date.now()}`,
      { projectId },
      {
        attempts: 1,
      },
    );

    this.logger.log(`Triggered manual daily scrum for project ${projectId}`);
  }
}
