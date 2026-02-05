import { Injectable, Logger } from '@nestjs/common';

export interface GitHubPR {
  number: number;
  title: string;
  body: string | null;
  state: string;
  html_url: string;
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
  created_at: string;
  updated_at: string;
  merged_at: string | null;
}

export interface GitHubFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export interface GitHubReviewComment {
  path: string;
  line: number;
  body: string;
  side?: 'LEFT' | 'RIGHT';
}

@Injectable()
export class GitHubService {
  private readonly logger = new Logger(GitHubService.name);
  private readonly baseUrl = 'https://api.github.com';

  /**
   * PAT 유효성 검증
   */
  async validatePat(pat: string): Promise<{ valid: boolean; user?: string; scopes?: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: this.getHeaders(pat),
      });

      if (!response.ok) {
        return { valid: false };
      }

      const user = await response.json();
      const scopes = response.headers.get('x-oauth-scopes')?.split(', ') || [];

      return {
        valid: true,
        user: user.login,
        scopes,
      };
    } catch (error) {
      this.logger.error('Failed to validate PAT', error);
      return { valid: false };
    }
  }

  /**
   * 레포지토리 목록 조회
   */
  async listRepositories(pat: string): Promise<{ owner: string; name: string; full_name: string }[]> {
    const response = await fetch(`${this.baseUrl}/user/repos?per_page=100&sort=updated`, {
      headers: this.getHeaders(pat),
    });

    if (!response.ok) {
      throw new Error(`Failed to list repositories: ${response.statusText}`);
    }

    const repos = await response.json();
    return repos.map((repo: { owner: { login: string }; name: string; full_name: string }) => ({
      owner: repo.owner.login,
      name: repo.name,
      full_name: repo.full_name,
    }));
  }

  /**
   * PR 상세 조회
   */
  async getPullRequest(
    pat: string,
    owner: string,
    repo: string,
    prNumber: number,
  ): Promise<GitHubPR> {
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}`, {
      headers: this.getHeaders(pat),
    });

    if (!response.ok) {
      throw new Error(`Failed to get PR: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * PR 변경 파일 목록 조회
   */
  async getPullRequestFiles(
    pat: string,
    owner: string,
    repo: string,
    prNumber: number,
  ): Promise<GitHubFile[]> {
    const response = await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=100`,
      {
        headers: this.getHeaders(pat),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to get PR files: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * PR에 리뷰 코멘트 추가
   */
  async createPullRequestReview(
    pat: string,
    owner: string,
    repo: string,
    prNumber: number,
    body: string,
    event: 'COMMENT' | 'APPROVE' | 'REQUEST_CHANGES' = 'COMMENT',
    comments: GitHubReviewComment[] = [],
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}/reviews`,
      {
        method: 'POST',
        headers: this.getHeaders(pat),
        body: JSON.stringify({
          body,
          event,
          comments: comments.map((c) => ({
            path: c.path,
            line: c.line,
            body: c.body,
            side: c.side || 'RIGHT',
          })),
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create PR review: ${error}`);
    }
  }

  /**
   * Issue/PR에 코멘트 추가
   */
  async createIssueComment(
    pat: string,
    owner: string,
    repo: string,
    issueNumber: number,
    body: string,
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
      {
        method: 'POST',
        headers: this.getHeaders(pat),
        body: JSON.stringify({ body }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to create comment: ${response.statusText}`);
    }
  }

  /**
   * 파일 내용 조회
   */
  async getFileContent(
    pat: string,
    owner: string,
    repo: string,
    path: string,
    ref?: string,
  ): Promise<string> {
    const url = new URL(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`);
    if (ref) {
      url.searchParams.set('ref', ref);
    }

    const response = await fetch(url.toString(), {
      headers: this.getHeaders(pat),
    });

    if (!response.ok) {
      throw new Error(`Failed to get file content: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.encoding === 'base64') {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }

    return data.content;
  }

  /**
   * GitHub Actions workflow 파일 생성/업데이트
   */
  async createOrUpdateWorkflow(
    pat: string,
    owner: string,
    repo: string,
    workflowPath: string,
    content: string,
    message: string,
  ): Promise<void> {
    // 기존 파일 확인
    let sha: string | undefined;
    try {
      const response = await fetch(
        `${this.baseUrl}/repos/${owner}/${repo}/contents/${workflowPath}`,
        {
          headers: this.getHeaders(pat),
        },
      );

      if (response.ok) {
        const data = await response.json();
        sha = data.sha;
      }
    } catch {
      // 파일이 없는 경우
    }

    const response = await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/contents/${workflowPath}`,
      {
        method: 'PUT',
        headers: this.getHeaders(pat),
        body: JSON.stringify({
          message,
          content: Buffer.from(content).toString('base64'),
          sha,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to create workflow: ${response.statusText}`);
    }
  }

  private getHeaders(pat: string): Record<string, string> {
    return {
      Authorization: `Bearer ${pat}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'SprintGhost',
    };
  }
}
