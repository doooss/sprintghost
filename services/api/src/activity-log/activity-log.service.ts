import { Injectable, Inject } from '@nestjs/common';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { DRIZZLE, DrizzleDB } from '../database/database.module';
import { activityLogs, ActivityLog, NewActivityLog } from '../database/schema';

export type EventType = 'pr_review' | 'pr_merge' | 'daily_scrum' | 'dod_check';
export type EventSource = 'github' | 'jira' | 'scheduler' | 'manual';
export type ActivityStatus = 'success' | 'failure' | 'skipped';

export interface CreateActivityLogDto {
  projectId: string;
  eventType: EventType;
  eventSource?: EventSource;
  prNumber?: number;
  prTitle?: string;
  jiraIssueKey?: string;
  status: ActivityStatus;
  summary?: string;
  details?: Record<string, unknown>;
}

export interface ActivityLogFilter {
  projectId?: string;
  eventType?: EventType;
  status?: ActivityStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

@Injectable()
export class ActivityLogService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(dto: CreateActivityLogDto): Promise<ActivityLog> {
    const id = nanoid();

    const newLog: NewActivityLog = {
      id,
      projectId: dto.projectId,
      eventType: dto.eventType,
      eventSource: dto.eventSource,
      prNumber: dto.prNumber,
      prTitle: dto.prTitle,
      jiraIssueKey: dto.jiraIssueKey,
      status: dto.status,
      summary: dto.summary,
      details: dto.details ? JSON.stringify(dto.details) : null,
    };

    await this.db.insert(activityLogs).values(newLog);

    return this.findOne(id);
  }

  async findOne(id: string): Promise<ActivityLog> {
    const result = await this.db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.id, id));

    return result[0];
  }

  async findAll(filter: ActivityLogFilter = {}): Promise<ActivityLog[]> {
    const conditions = [];

    if (filter.projectId) {
      conditions.push(eq(activityLogs.projectId, filter.projectId));
    }

    if (filter.eventType) {
      conditions.push(eq(activityLogs.eventType, filter.eventType));
    }

    if (filter.status) {
      conditions.push(eq(activityLogs.status, filter.status));
    }

    if (filter.startDate) {
      conditions.push(gte(activityLogs.createdAt, filter.startDate));
    }

    if (filter.endDate) {
      conditions.push(lte(activityLogs.createdAt, filter.endDate));
    }

    const query = this.db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(filter.limit || 50)
      .offset(filter.offset || 0);

    if (conditions.length > 0) {
      return query.where(and(...conditions));
    }

    return query;
  }

  async findByProject(
    projectId: string,
    limit: number = 50,
  ): Promise<ActivityLog[]> {
    return this.findAll({ projectId, limit });
  }

  async getStats(projectId: string, days: number = 7): Promise<{
    total: number;
    success: number;
    failure: number;
    byEventType: Record<string, number>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.findAll({
      projectId,
      startDate,
      limit: 1000,
    });

    const stats = {
      total: logs.length,
      success: logs.filter((l) => l.status === 'success').length,
      failure: logs.filter((l) => l.status === 'failure').length,
      byEventType: {} as Record<string, number>,
    };

    for (const log of logs) {
      stats.byEventType[log.eventType] =
        (stats.byEventType[log.eventType] || 0) + 1;
    }

    return stats;
  }

  /**
   * 오래된 로그 정리 (30일 이상)
   */
  async cleanup(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.db
      .delete(activityLogs)
      .where(lte(activityLogs.createdAt, cutoffDate));

    return result.changes;
  }
}
