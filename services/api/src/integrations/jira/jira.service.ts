import { Injectable, Logger } from '@nestjs/common';

export interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: {
    summary: string;
    description?: string;
    status: {
      name: string;
      id: string;
    };
    assignee?: {
      displayName: string;
      emailAddress: string;
    };
    issuetype: {
      name: string;
    };
    priority?: {
      name: string;
    };
    created: string;
    updated: string;
  };
}

export interface JiraTransition {
  id: string;
  name: string;
  to: {
    name: string;
    id: string;
  };
}

export interface JiraConfig {
  host: string;
  email: string;
  apiToken: string;
}

@Injectable()
export class JiraService {
  private readonly logger = new Logger(JiraService.name);

  /**
   * 인증 정보 유효성 검증
   */
  async validateCredentials(config: JiraConfig): Promise<{ valid: boolean; user?: string }> {
    try {
      const response = await fetch(`${config.host}/rest/api/3/myself`, {
        headers: this.getHeaders(config),
      });

      if (!response.ok) {
        return { valid: false };
      }

      const user = await response.json();
      return {
        valid: true,
        user: user.displayName,
      };
    } catch (error) {
      this.logger.error('Failed to validate Jira credentials', error);
      return { valid: false };
    }
  }

  /**
   * 이슈 조회
   */
  async getIssue(config: JiraConfig, issueKey: string): Promise<JiraIssue> {
    const response = await fetch(
      `${config.host}/rest/api/3/issue/${issueKey}?fields=summary,description,status,assignee,issuetype,priority,created,updated`,
      {
        headers: this.getHeaders(config),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to get issue: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 이슈 검색 (JQL)
   */
  async searchIssues(
    config: JiraConfig,
    jql: string,
    maxResults: number = 50,
  ): Promise<JiraIssue[]> {
    const response = await fetch(`${config.host}/rest/api/3/search`, {
      method: 'POST',
      headers: this.getHeaders(config),
      body: JSON.stringify({
        jql,
        maxResults,
        fields: ['summary', 'description', 'status', 'assignee', 'issuetype', 'priority', 'created', 'updated'],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to search issues: ${response.statusText}`);
    }

    const data = await response.json();
    return data.issues;
  }

  /**
   * 스프린트의 진행 중인 이슈 조회
   */
  async getInProgressIssues(config: JiraConfig, projectKey: string): Promise<JiraIssue[]> {
    const jql = `project = ${projectKey} AND status = "In Progress" ORDER BY updated DESC`;
    return this.searchIssues(config, jql);
  }

  /**
   * 활성 스프린트 이슈 조회 (JQL 기반)
   */
  async getActiveSprintIssues(config: JiraConfig, projectKey: string): Promise<JiraIssue[]> {
    const jql = `project = ${projectKey} AND sprint in openSprints() ORDER BY updated DESC`;
    try {
      return await this.searchIssues(config, jql);
    } catch (error) {
      this.logger.warn(`Failed to get active sprint issues: ${error}`);
      return [];
    }
  }

  /**
   * 최근 N일 내 업데이트된 이슈 조회 (Fallback 모드)
   */
  async getRecentIssues(config: JiraConfig, projectKey: string, days: number): Promise<JiraIssue[]> {
    const jql = `project = ${projectKey} AND updated >= -${days}d AND status NOT IN (Done, Closed) AND issuetype IN (Story, Task, Bug) ORDER BY updated DESC`;
    return this.searchIssues(config, jql);
  }

  /**
   * 데일리 스크럼용 이슈 조회 (스프린트 또는 Fallback 자동 선택)
   */
  async getDailyScrumIssues(
    config: JiraConfig,
    projectKey: string,
    fallbackEnabled: boolean,
    fallbackDays: number,
  ): Promise<{ issues: JiraIssue[]; mode: 'sprint' | 'fallback'; sprintName?: string }> {
    // 1. 활성 스프린트 이슈 조회 시도
    const sprintIssues = await this.getActiveSprintIssues(config, projectKey);

    if (sprintIssues.length > 0) {
      return { issues: sprintIssues, mode: 'sprint' };
    }

    // 2. Fallback 모드 (설정 활성화 시)
    if (fallbackEnabled) {
      this.logger.log(`No active sprint found for ${projectKey}, using fallback mode (${fallbackDays} days)`);
      const fallbackIssues = await this.getRecentIssues(config, projectKey, fallbackDays);
      return { issues: fallbackIssues, mode: 'fallback' };
    }

    return { issues: [], mode: 'sprint' };
  }

  /**
   * 이슈 상태 전환 가능 목록 조회
   */
  async getTransitions(config: JiraConfig, issueKey: string): Promise<JiraTransition[]> {
    const response = await fetch(`${config.host}/rest/api/3/issue/${issueKey}/transitions`, {
      headers: this.getHeaders(config),
    });

    if (!response.ok) {
      throw new Error(`Failed to get transitions: ${response.statusText}`);
    }

    const data = await response.json();
    return data.transitions;
  }

  /**
   * 이슈 상태 변경
   */
  async transitionIssue(
    config: JiraConfig,
    issueKey: string,
    transitionId: string,
    comment?: string,
  ): Promise<void> {
    const body: { transition: { id: string }; update?: { comment?: { add: { body: string } }[] } } = {
      transition: { id: transitionId },
    };

    if (comment) {
      body.update = {
        comment: [
          {
            add: {
              body: comment,
            },
          },
        ],
      };
    }

    const response = await fetch(`${config.host}/rest/api/3/issue/${issueKey}/transitions`, {
      method: 'POST',
      headers: this.getHeaders(config),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to transition issue: ${response.statusText}`);
    }
  }

  /**
   * 이슈에 코멘트 추가
   */
  async addComment(config: JiraConfig, issueKey: string, comment: string): Promise<void> {
    const response = await fetch(`${config.host}/rest/api/3/issue/${issueKey}/comment`, {
      method: 'POST',
      headers: this.getHeaders(config),
      body: JSON.stringify({
        body: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: comment,
                },
              ],
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add comment: ${response.statusText}`);
    }
  }

  /**
   * 이름으로 상태 전환
   */
  async transitionIssueByName(
    config: JiraConfig,
    issueKey: string,
    targetStatusName: string,
    comment?: string,
  ): Promise<boolean> {
    const transitions = await this.getTransitions(config, issueKey);
    const transition = transitions.find(
      (t) => t.name.toLowerCase() === targetStatusName.toLowerCase() ||
             t.to.name.toLowerCase() === targetStatusName.toLowerCase(),
    );

    if (!transition) {
      this.logger.warn(`No transition found to status: ${targetStatusName} for issue: ${issueKey}`);
      return false;
    }

    await this.transitionIssue(config, issueKey, transition.id, comment);
    return true;
  }

  /**
   * PR 브랜치 이름에서 Jira 이슈 키 추출
   */
  extractIssueKey(branchName: string, projectKey: string): string | null {
    const pattern = new RegExp(`(${projectKey}-\\d+)`, 'i');
    const match = branchName.match(pattern);
    return match ? match[1].toUpperCase() : null;
  }

  private getHeaders(config: JiraConfig): Record<string, string> {
    const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');
    return {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
  }
}
