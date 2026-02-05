import { Injectable, Logger } from '@nestjs/common';
import { Project } from '../../database/schema';
import { GitHubService } from '../../integrations/github/github.service';
import { SlackService } from '../../integrations/slack/slack.service';
import { AIService, AIProvider } from '../../integrations/ai/ai.service';
import { CryptoService } from '../../common/crypto/crypto.service';
import { ActivityLogService } from '../../activity-log/activity-log.service';
import { GitHubWebhookPayload } from '../webhook.service';

interface DodChecklistItem {
  id: string;
  label: string;
  required?: boolean;
}

@Injectable()
export class DODCheckHandler {
  private readonly logger = new Logger(DODCheckHandler.name);

  constructor(
    private readonly githubService: GitHubService,
    private readonly slackService: SlackService,
    private readonly aiService: AIService,
    private readonly cryptoService: CryptoService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async handle(
    project: Project,
    payload: GitHubWebhookPayload,
  ): Promise<{ processed: boolean; message: string; passed?: boolean }> {
    const pr = payload.pull_request;
    if (!pr || !payload.repository) {
      return { processed: false, message: 'Invalid payload' };
    }

    // DOD 체크리스트가 설정되지 않은 경우
    if (!project.dodChecklist) {
      return { processed: false, message: 'DOD checklist not configured' };
    }

    let checklist: DodChecklistItem[];
    try {
      checklist = JSON.parse(project.dodChecklist);
    } catch {
      return { processed: false, message: 'Invalid DOD checklist format' };
    }

    if (checklist.length === 0) {
      return { processed: false, message: 'DOD checklist is empty' };
    }

    const owner = payload.repository.owner.login;
    const repo = payload.repository.name;

    this.logger.log(`Processing DOD check for PR: ${owner}/${repo}#${pr.number}`);

    // GitHub PAT 복호화
    const githubPat = this.cryptoService.decryptIfNeeded(project.githubPat);
    if (!githubPat) {
      return { processed: false, message: 'GitHub PAT not configured' };
    }

    // AI 설정 확인
    const aiApiKey = this.cryptoService.decryptIfNeeded(project.aiApiKey);
    if (!aiApiKey || !project.aiProvider) {
      return { processed: false, message: 'AI not configured' };
    }

    try {
      // PR 파일 목록 가져오기
      const files = await this.githubService.getPullRequestFiles(
        githubPat,
        owner,
        repo,
        pr.number,
      );

      // AI DOD 체크
      const dodResult = await this.aiService.checkDOD(
        {
          provider: project.aiProvider as AIProvider,
          apiKey: aiApiKey,
          model: project.aiModel || undefined,
        },
        {
          title: pr.title,
          description: pr.body,
          files: files.map((f) => ({
            filename: f.filename,
            patch: f.patch,
          })),
        },
        checklist.map((item) => ({
          id: item.id,
          label: item.label,
          required: item.required ?? false,
        })),
      );

      // 필수 항목 체크
      const requiredChecks = checklist.filter((item) => item.required);
      const failedRequired = requiredChecks.filter((item) => {
        const result = dodResult.results.find((r) => r.id === item.id);
        return !result?.passed;
      });

      const passed = failedRequired.length === 0;

      // 결과 포맷팅
      const checklistWithResults = checklist.map((item) => {
        const result = dodResult.results.find((r) => r.id === item.id);
        return {
          label: item.label,
          passed: result?.passed ?? false,
          required: item.required ?? false,
          reason: result?.reason,
        };
      });

      // GitHub에 코멘트 추가
      const statusEmoji = passed ? '✅' : '❌';
      const statusText = passed ? 'DOD Check Passed' : 'DOD Check Failed';

      const checklistMarkdown = checklistWithResults
        .map((item) => {
          const emoji = item.passed ? '✅' : item.required ? '❌' : '⚠️';
          const requiredTag = item.required ? ' **(required)**' : '';
          return `- ${emoji} ${item.label}${requiredTag}${item.reason ? `\n  > ${item.reason}` : ''}`;
        })
        .join('\n');

      const comment = `## ${statusEmoji} ${statusText}

### Checklist Results
${checklistMarkdown}

### Summary
${dodResult.summary}

---
_Checked by SprintGhost_`;

      await this.githubService.createIssueComment(
        githubPat,
        owner,
        repo,
        pr.number,
        comment,
      );

      // Slack 알림 (설정된 경우)
      const slackWebhookUrl = this.cryptoService.decryptIfNeeded(project.slackWebhookUrl);
      if (slackWebhookUrl) {
        await this.slackService.sendDODCheckNotification(slackWebhookUrl, {
          prTitle: pr.title,
          prUrl: pr.html_url,
          prNumber: pr.number,
          passed,
          checklist: checklistWithResults,
          summary: dodResult.summary,
        });
      }

      this.logger.log(`DOD check completed for PR #${pr.number}: ${passed ? 'PASSED' : 'FAILED'}`);

      // 활동 로그 기록
      await this.activityLogService.create({
        projectId: project.id,
        eventType: 'dod_check',
        eventSource: 'github',
        prNumber: pr.number,
        prTitle: pr.title,
        status: passed ? 'success' : 'failure',
        summary: `DOD check ${passed ? 'passed' : 'failed'} for PR #${pr.number}`,
        details: {
          passed,
          checklistResults: checklistWithResults,
        },
      });

      return {
        processed: true,
        message: `DOD check ${passed ? 'passed' : 'failed'} for PR #${pr.number}`,
        passed,
      };
    } catch (error) {
      this.logger.error(`Failed to process DOD check: ${error}`);

      // 실패 로그 기록
      await this.activityLogService.create({
        projectId: project.id,
        eventType: 'dod_check',
        eventSource: 'github',
        prNumber: pr.number,
        prTitle: pr.title,
        status: 'failure',
        summary: `Failed to check DOD for PR #${pr.number}`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });

      return {
        processed: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}
