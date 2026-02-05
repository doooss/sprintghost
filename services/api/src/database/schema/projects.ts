import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),

  // GitHub 설정 (암호화됨)
  githubPat: text('github_pat'),
  githubOwner: text('github_owner'),
  githubRepo: text('github_repo'),

  // Jira 설정 (암호화됨)
  jiraHost: text('jira_host'),
  jiraEmail: text('jira_email'),
  jiraApiToken: text('jira_api_token'),
  jiraProjectKey: text('jira_project_key'),

  // Slack 설정 (암호화됨)
  slackWebhookUrl: text('slack_webhook_url'),

  // AI 설정 (암호화됨)
  aiProvider: text('ai_provider'), // 'openai' | 'anthropic' | 'google'
  aiApiKey: text('ai_api_key'),
  aiModel: text('ai_model'),

  // 웹훅 키 (프로젝트 식별용)
  webhookKey: text('webhook_key').notNull().unique(),

  // DOD 설정
  dodChecklist: text('dod_checklist'), // JSON string

  // 데일리 스크럼 설정
  dailyScrumEnabled: integer('daily_scrum_enabled', { mode: 'boolean' }).default(false),
  dailyScrumCron: text('daily_scrum_cron'), // e.g., '0 9 * * 1-5'
  dailyScrumTimezone: text('daily_scrum_timezone').default('Asia/Seoul'),

  // Jira 스프린트 Fallback 설정
  jiraFallbackEnabled: integer('jira_fallback_enabled', { mode: 'boolean' }).default(true),
  jiraFallbackDays: integer('jira_fallback_days').default(7), // 스프린트 없을 때 조회 기간

  // 타임스탬프
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
