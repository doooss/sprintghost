import { Injectable, Logger } from '@nestjs/common';
import { Project } from '../database/schema';
import { PROpenedHandler } from './handlers/pr-opened.handler';
import { PRMergedHandler } from './handlers/pr-merged.handler';
import { DODCheckHandler } from './handlers/dod-check.handler';

export type GitHubEventType =
  | 'pull_request'
  | 'pull_request_review'
  | 'push'
  | 'issue_comment';

export interface GitHubWebhookPayload {
  action?: string;
  pull_request?: {
    number: number;
    title: string;
    body: string | null;
    html_url: string;
    state: string;
    merged: boolean;
    user: {
      login: string;
      avatar_url: string;
    };
    head: {
      ref: string;
      sha: string;
    };
    base: {
      ref: string;
    };
  };
  repository?: {
    name: string;
    full_name: string;
    owner: {
      login: string;
    };
  };
  sender?: {
    login: string;
  };
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly prOpenedHandler: PROpenedHandler,
    private readonly prMergedHandler: PRMergedHandler,
    private readonly dodCheckHandler: DODCheckHandler,
  ) {}

  async handleGitHubWebhook(
    project: Project,
    eventType: GitHubEventType,
    payload: GitHubWebhookPayload,
  ): Promise<{ processed: boolean; message: string }> {
    this.logger.log(`Processing GitHub webhook: ${eventType} - ${payload.action}`);

    // pull_request 이벤트 처리
    if (eventType === 'pull_request' && payload.pull_request) {
      const action = payload.action;

      if (action === 'opened' || action === 'synchronize') {
        // PR 열림/업데이트 시 AI 리뷰 수행
        const reviewResult = await this.prOpenedHandler.handle(project, payload);

        // DOD 체크리스트가 있는 경우 DOD 검사도 수행
        if (project.dodChecklist) {
          await this.dodCheckHandler.handle(project, payload);
        }

        return reviewResult;
      }

      if (action === 'closed' && payload.pull_request.merged) {
        return this.prMergedHandler.handle(project, payload);
      }
    }

    return {
      processed: false,
      message: `Event ${eventType}:${payload.action} not handled`,
    };
  }

  /**
   * 수동 DOD 체크 실행
   */
  async runDODCheck(
    project: Project,
    payload: GitHubWebhookPayload,
  ): Promise<{ processed: boolean; message: string; passed?: boolean }> {
    return this.dodCheckHandler.handle(project, payload);
  }
}
