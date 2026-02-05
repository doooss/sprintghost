import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { projects } from './projects';

export const activityLogs = sqliteTable('activity_logs', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),

  // 이벤트 정보
  eventType: text('event_type').notNull(), // 'pr_review' | 'pr_merge' | 'daily_scrum' | 'dod_check'
  eventSource: text('event_source'), // 'github' | 'jira' | 'scheduler'

  // 관련 엔티티
  prNumber: integer('pr_number'),
  prTitle: text('pr_title'),
  jiraIssueKey: text('jira_issue_key'),

  // 결과
  status: text('status').notNull(), // 'success' | 'failure' | 'skipped'
  summary: text('summary'),
  details: text('details'), // JSON string for detailed info

  // 타임스탬프
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
