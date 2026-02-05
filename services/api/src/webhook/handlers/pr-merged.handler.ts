import { Injectable, Logger } from '@nestjs/common';
import { Project } from '../../database/schema';
import { JiraService } from '../../integrations/jira/jira.service';
import { SlackService } from '../../integrations/slack/slack.service';
import { CryptoService } from '../../common/crypto/crypto.service';
import { ActivityLogService } from '../../activity-log/activity-log.service';
import { GitHubWebhookPayload } from '../webhook.service';

@Injectable()
export class PRMergedHandler {
  private readonly logger = new Logger(PRMergedHandler.name);

  constructor(
    private readonly jiraService: JiraService,
    private readonly slackService: SlackService,
    private readonly cryptoService: CryptoService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async handle(
    project: Project,
    payload: GitHubWebhookPayload,
  ): Promise<{ processed: boolean; message: string }> {
    const pr = payload.pull_request;
    if (!pr || !payload.repository) {
      return { processed: false, message: 'Invalid payload' };
    }

    this.logger.log(`Processing PR merged: ${payload.repository.full_name}#${pr.number}`);

    let jiraIssueKey: string | null = null;
    let jiraIssueUrl: string | null = null;
    let newStatus: string | undefined;

    // Jira 설정 확인 및 이슈 상태 변경
    if (project.jiraHost && project.jiraProjectKey) {
      const jiraApiToken = this.cryptoService.decryptIfNeeded(project.jiraApiToken);

      if (jiraApiToken && project.jiraEmail) {
        // PR 브랜치 이름에서 Jira 이슈 키 추출
        jiraIssueKey = this.jiraService.extractIssueKey(pr.head.ref, project.jiraProjectKey);

        if (jiraIssueKey) {
          this.logger.log(`Found Jira issue key: ${jiraIssueKey}`);

          const jiraConfig = {
            host: project.jiraHost,
            email: project.jiraEmail,
            apiToken: jiraApiToken,
          };

          try {
            // "Done" 또는 "완료" 상태로 전환 시도
            const transitioned = await this.jiraService.transitionIssueByName(
              jiraConfig,
              jiraIssueKey,
              'Done',
              `PR #${pr.number} merged: ${pr.title}`,
            );

            if (transitioned) {
              newStatus = 'Done';
              this.logger.log(`Jira issue ${jiraIssueKey} transitioned to Done`);
            } else {
              // "완료" 시도
              const transitionedKo = await this.jiraService.transitionIssueByName(
                jiraConfig,
                jiraIssueKey,
                '완료',
                `PR #${pr.number} merged: ${pr.title}`,
              );

              if (transitionedKo) {
                newStatus = '완료';
                this.logger.log(`Jira issue ${jiraIssueKey} transitioned to 완료`);
              }
            }

            jiraIssueUrl = `${project.jiraHost}/browse/${jiraIssueKey}`;
          } catch (error) {
            this.logger.warn(`Failed to transition Jira issue: ${error}`);
          }
        }
      }
    }

    // Slack 알림 전송
    const slackWebhookUrl = this.cryptoService.decryptIfNeeded(project.slackWebhookUrl);
    if (slackWebhookUrl) {
      try {
        await this.slackService.sendPRMergeNotification(slackWebhookUrl, {
          prTitle: pr.title,
          prUrl: pr.html_url,
          prNumber: pr.number,
          author: pr.user.login,
          jiraIssueKey: jiraIssueKey || undefined,
          jiraIssueUrl: jiraIssueUrl || undefined,
          newStatus,
        });

        this.logger.log(`Slack notification sent for PR #${pr.number}`);
      } catch (error) {
        this.logger.warn(`Failed to send Slack notification: ${error}`);
      }
    }

    // 활동 로그 기록
    await this.activityLogService.create({
      projectId: project.id,
      eventType: 'pr_merge',
      eventSource: 'github',
      prNumber: pr.number,
      prTitle: pr.title,
      jiraIssueKey: jiraIssueKey || undefined,
      status: 'success',
      summary: `PR #${pr.number} merged${jiraIssueKey ? `, Jira ${jiraIssueKey} → ${newStatus || 'updated'}` : ''}`,
      details: {
        author: pr.user.login,
        jiraTransitioned: !!newStatus,
        slackNotified: !!slackWebhookUrl,
      },
    });

    return {
      processed: true,
      message: `PR #${pr.number} merged${jiraIssueKey ? `, Jira ${jiraIssueKey} updated` : ''}`,
    };
  }
}
