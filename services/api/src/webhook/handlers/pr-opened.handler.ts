import { Injectable, Logger } from '@nestjs/common';
import { Project } from '../../database/schema';
import { GitHubService } from '../../integrations/github/github.service';
import { SlackService } from '../../integrations/slack/slack.service';
import { AIService, AIProvider } from '../../integrations/ai/ai.service';
import { CryptoService } from '../../common/crypto/crypto.service';
import { ActivityLogService } from '../../activity-log/activity-log.service';
import { GitHubWebhookPayload } from '../webhook.service';

@Injectable()
export class PROpenedHandler {
  private readonly logger = new Logger(PROpenedHandler.name);

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
  ): Promise<{ processed: boolean; message: string }> {
    const pr = payload.pull_request;
    if (!pr || !payload.repository) {
      return { processed: false, message: 'Invalid payload' };
    }

    const owner = payload.repository.owner.login;
    const repo = payload.repository.name;

    this.logger.log(`Processing PR opened: ${owner}/${repo}#${pr.number}`);

    // GitHub PAT 복호화
    const githubPat = this.cryptoService.decryptIfNeeded(project.githubPat);
    if (!githubPat) {
      return { processed: false, message: 'GitHub PAT not configured' };
    }

    // AI 설정 확인
    const aiApiKey = this.cryptoService.decryptIfNeeded(project.aiApiKey);
    if (!aiApiKey || !project.aiProvider) {
      this.logger.warn('AI not configured, skipping review');
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

      // AI 리뷰 생성
      const review = await this.aiService.generatePRReview(
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
      );

      // GitHub에 리뷰 코멘트 추가
      await this.githubService.createPullRequestReview(
        githubPat,
        owner,
        repo,
        pr.number,
        `## 🤖 AI Code Review\n\n${review}\n\n---\n_Reviewed by SprintGhost_`,
        'COMMENT',
      );

      // Slack 알림 (설정된 경우)
      const slackWebhookUrl = this.cryptoService.decryptIfNeeded(project.slackWebhookUrl);
      if (slackWebhookUrl) {
        await this.slackService.sendPRReviewNotification(slackWebhookUrl, {
          prTitle: pr.title,
          prUrl: pr.html_url,
          prNumber: pr.number,
          author: pr.user.login,
          reviewer: 'SprintGhost AI',
          summary: review.substring(0, 500) + (review.length > 500 ? '...' : ''),
          status: 'commented',
        });
      }

      this.logger.log(`PR review completed for ${owner}/${repo}#${pr.number}`);

      // 활동 로그 기록
      await this.activityLogService.create({
        projectId: project.id,
        eventType: 'pr_review',
        eventSource: 'github',
        prNumber: pr.number,
        prTitle: pr.title,
        status: 'success',
        summary: `AI review posted to PR #${pr.number}`,
        details: { owner, repo, filesReviewed: files.length },
      });

      return {
        processed: true,
        message: `Review posted to PR #${pr.number}`,
      };
    } catch (error) {
      this.logger.error(`Failed to process PR opened: ${error}`);

      // 실패 로그 기록
      await this.activityLogService.create({
        projectId: project.id,
        eventType: 'pr_review',
        eventSource: 'github',
        prNumber: pr.number,
        prTitle: pr.title,
        status: 'failure',
        summary: `Failed to review PR #${pr.number}`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });

      return {
        processed: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}
