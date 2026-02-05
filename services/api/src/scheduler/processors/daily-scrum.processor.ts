import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ProjectsService } from '../../projects/projects.service';
import { JiraService } from '../../integrations/jira/jira.service';
import { SlackService } from '../../integrations/slack/slack.service';
import { AIService, AIProvider } from '../../integrations/ai/ai.service';
import { CryptoService } from '../../common/crypto/crypto.service';
import { ActivityLogService } from '../../activity-log/activity-log.service';

export const DAILY_SCRUM_QUEUE = 'daily-scrum';

export interface DailyScrumJobData {
  projectId: string;
}

@Processor(DAILY_SCRUM_QUEUE)
export class DailyScrumProcessor extends WorkerHost {
  private readonly logger = new Logger(DailyScrumProcessor.name);

  constructor(
    private readonly projectsService: ProjectsService,
    private readonly jiraService: JiraService,
    private readonly slackService: SlackService,
    private readonly aiService: AIService,
    private readonly cryptoService: CryptoService,
    private readonly activityLogService: ActivityLogService,
  ) {
    super();
  }

  async process(job: Job<DailyScrumJobData>): Promise<void> {
    const { projectId } = job.data;
    this.logger.log(`Processing daily scrum for project: ${projectId}`);

    try {
      const project = await this.projectsService.findOne(projectId);

      // Jira 설정 확인
      if (!project.jiraHost || !project.jiraProjectKey || !project.jiraEmail) {
        this.logger.warn(`Project ${projectId} does not have Jira configured`);
        return;
      }

      const jiraApiToken = this.cryptoService.decryptIfNeeded(project.jiraApiToken);
      if (!jiraApiToken) {
        this.logger.warn(`Project ${projectId} does not have Jira API token`);
        return;
      }

      const jiraConfig = {
        host: project.jiraHost,
        email: project.jiraEmail,
        apiToken: jiraApiToken,
      };

      // 스프린트 또는 Fallback 모드로 이슈 조회
      const fallbackEnabled = project.jiraFallbackEnabled ?? true;
      const fallbackDays = project.jiraFallbackDays ?? 7;

      const { issues, mode } = await this.jiraService.getDailyScrumIssues(
        jiraConfig,
        project.jiraProjectKey,
        fallbackEnabled,
        fallbackDays,
      );

      if (issues.length === 0) {
        this.logger.log(`No issues found for project ${projectId} (mode: ${mode})`);
        return;
      }

      this.logger.log(`Found ${issues.length} issues for project ${projectId} (mode: ${mode})`);

      // AI 요약 생성 (설정된 경우)
      let summary = `${issues.length} issues currently tracked.`;
      const aiApiKey = this.cryptoService.decryptIfNeeded(project.aiApiKey);

      if (aiApiKey && project.aiProvider) {
        try {
          summary = await this.aiService.generateDailyScrumSummary(
            {
              provider: project.aiProvider as AIProvider,
              apiKey: aiApiKey,
              model: project.aiModel || undefined,
            },
            issues.map((i) => ({
              key: i.key,
              summary: i.fields.summary,
              assignee: i.fields.assignee?.displayName || null,
              status: i.fields.status.name,
            })),
          );
        } catch (error) {
          this.logger.warn(`Failed to generate AI summary: ${error}`);
        }
      }

      // Slack 알림 전송
      const slackWebhookUrl = this.cryptoService.decryptIfNeeded(project.slackWebhookUrl);
      if (slackWebhookUrl) {
        const today = new Date().toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        });

        // 모드에 따라 제목 구분
        const modeLabel = mode === 'fallback'
          ? `최근 ${fallbackDays}일 이슈 현황`
          : 'Sprint';

        await this.slackService.sendDailyScrumNotification(slackWebhookUrl, {
          projectName: project.name,
          date: today,
          inProgressIssues: issues.map((i) => ({
            key: i.key,
            summary: i.fields.summary,
            assignee: i.fields.assignee?.displayName || 'Unassigned',
          })),
          summary,
          mode,
          modeLabel,
        });

        this.logger.log(`Daily scrum notification sent for project ${projectId} (mode: ${mode})`);

        // 활동 로그 기록
        await this.activityLogService.create({
          projectId,
          eventType: 'daily_scrum',
          eventSource: 'scheduler',
          status: 'success',
          summary: `Daily scrum sent: ${issues.length} issues (${mode} mode)`,
          details: {
            issueCount: issues.length,
            issues: issues.map((i) => i.key),
            mode,
          },
        });
      }
    } catch (error) {
      this.logger.error(`Failed to process daily scrum for project ${projectId}:`, error);

      // 실패 로그 기록
      await this.activityLogService.create({
        projectId,
        eventType: 'daily_scrum',
        eventSource: 'scheduler',
        status: 'failure',
        summary: `Failed to send daily scrum`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });

      throw error;
    }
  }
}
