import { Injectable, Logger } from '@nestjs/common';

export interface SlackTextElement {
  type: string;
  text: string;
  emoji?: boolean;
}

export interface SlackBlock {
  type: string;
  text?: SlackTextElement;
  elements?: SlackTextElement[];
  accessory?: {
    type: string;
    text?: SlackTextElement;
    url?: string;
    action_id?: string;
  };
  fields?: {
    type: string;
    text: string;
  }[];
}

export interface SlackMessage {
  text?: string;
  blocks?: SlackBlock[];
  attachments?: {
    color?: string;
    blocks?: SlackBlock[];
  }[];
}

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);

  /**
   * 웹훅 URL 유효성 검증
   */
  async validateWebhook(webhookUrl: string): Promise<boolean> {
    try {
      // Slack은 GET 요청을 지원하지 않으므로 간단한 메시지 전송으로 테스트
      // 실제 환경에서는 테스트 채널에 메시지를 보내는 것이 좋음
      const url = new URL(webhookUrl);
      return url.host.includes('slack.com') || url.host.includes('hooks.slack.com');
    } catch {
      return false;
    }
  }

  /**
   * 메시지 전송
   */
  async sendMessage(webhookUrl: string, message: SlackMessage): Promise<void> {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send Slack message: ${error}`);
    }
  }

  /**
   * 간단한 텍스트 메시지 전송
   */
  async sendText(webhookUrl: string, text: string): Promise<void> {
    await this.sendMessage(webhookUrl, { text });
  }

  /**
   * PR 리뷰 알림 전송
   */
  async sendPRReviewNotification(
    webhookUrl: string,
    options: {
      prTitle: string;
      prUrl: string;
      prNumber: number;
      author: string;
      reviewer: string;
      summary: string;
      status: 'approved' | 'changes_requested' | 'commented';
    },
  ): Promise<void> {
    const statusEmoji = {
      approved: '✅',
      changes_requested: '🔄',
      commented: '💬',
    };

    const statusText = {
      approved: 'Approved',
      changes_requested: 'Changes Requested',
      commented: 'Commented',
    };

    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${statusEmoji[options.status]} PR Review: ${statusText[options.status]}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*<${options.prUrl}|#${options.prNumber} ${options.prTitle}>*`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Author:*\n${options.author}`,
          },
          {
            type: 'mrkdwn',
            text: `*Reviewer:*\n${options.reviewer}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Summary:*\n${options.summary}`,
        },
      },
      {
        type: 'divider',
      },
    ];

    await this.sendMessage(webhookUrl, { blocks });
  }

  /**
   * 데일리 스크럼 알림 전송
   */
  async sendDailyScrumNotification(
    webhookUrl: string,
    options: {
      projectName: string;
      date: string;
      inProgressIssues: { key: string; summary: string; assignee: string }[];
      summary: string;
      mode?: 'sprint' | 'fallback';
      modeLabel?: string;
    },
  ): Promise<void> {
    const mode = options.mode || 'sprint';
    const modeLabel = options.modeLabel || 'Sprint';

    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `📋 Daily Scrum - ${options.projectName} (${modeLabel})`,
          emoji: true,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'plain_text',
            text: options.date,
          },
        ],
      },
    ];

    // Fallback 모드 경고 표시
    if (mode === 'fallback') {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '⚠️ _활성 스프린트가 없어 최근 업데이트된 이슈를 표시합니다._',
        },
      });
    }

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Issues:*',
      },
    });

    // 진행 중인 이슈 목록
    for (const issue of options.inProgressIssues.slice(0, 10)) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *${issue.key}*: ${issue.summary}\n  _Assignee: ${issue.assignee || 'Unassigned'}_`,
        },
      });
    }

    if (options.inProgressIssues.length > 10) {
      blocks.push({
        type: 'context',
        elements: [
          {
            type: 'plain_text',
            text: `... and ${options.inProgressIssues.length - 10} more issues`,
          },
        ],
      });
    }

    blocks.push(
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*AI Summary:*\n${options.summary}`,
        },
      },
    );

    await this.sendMessage(webhookUrl, { blocks });
  }

  /**
   * PR 머지 알림 전송
   */
  async sendPRMergeNotification(
    webhookUrl: string,
    options: {
      prTitle: string;
      prUrl: string;
      prNumber: number;
      author: string;
      jiraIssueKey?: string;
      jiraIssueUrl?: string;
      newStatus?: string;
    },
  ): Promise<void> {
    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🎉 PR Merged',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*<${options.prUrl}|#${options.prNumber} ${options.prTitle}>*`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Author:*\n${options.author}`,
          },
        ],
      },
    ];

    if (options.jiraIssueKey) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Jira Issue:* <${options.jiraIssueUrl}|${options.jiraIssueKey}>${options.newStatus ? ` → ${options.newStatus}` : ''}`,
        },
      });
    }

    blocks.push({
      type: 'divider',
    });

    await this.sendMessage(webhookUrl, { blocks });
  }

  /**
   * DOD 체크 결과 알림 전송
   */
  async sendDODCheckNotification(
    webhookUrl: string,
    options: {
      prTitle: string;
      prUrl: string;
      prNumber: number;
      passed: boolean;
      checklist: { label: string; passed: boolean; required: boolean }[];
      summary: string;
    },
  ): Promise<void> {
    const statusEmoji = options.passed ? '✅' : '❌';
    const statusText = options.passed ? 'DOD Check Passed' : 'DOD Check Failed';

    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${statusEmoji} ${statusText}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*<${options.prUrl}|#${options.prNumber} ${options.prTitle}>*`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Checklist:*',
        },
      },
    ];

    // 체크리스트 항목
    const checklistText = options.checklist
      .map((item) => {
        const emoji = item.passed ? '✅' : item.required ? '❌' : '⚠️';
        const requiredTag = item.required ? ' _(required)_' : '';
        return `${emoji} ${item.label}${requiredTag}`;
      })
      .join('\n');

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: checklistText,
      },
    });

    blocks.push(
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Summary:*\n${options.summary}`,
        },
      },
    );

    await this.sendMessage(webhookUrl, { blocks });
  }
}
