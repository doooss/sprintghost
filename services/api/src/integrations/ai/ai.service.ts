import { Injectable, Logger } from '@nestjs/common';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type AIProvider = 'openai' | 'anthropic' | 'google';

export interface AICompletionOptions {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// 토큰 제한을 위한 상수
const MAX_FILES = 15;
const MAX_PATCH_LENGTH = 1500;
const MAX_TOTAL_CONTENT = 12000;

// 우선순위가 낮은 파일 패턴
const LOW_PRIORITY_PATTERNS = [
  /\.lock$/,
  /package-lock\.json$/,
  /pnpm-lock\.yaml$/,
  /yarn\.lock$/,
  /\.min\.(js|css)$/,
  /\.map$/,
  /\.d\.ts$/,
  /\.snap$/,
  /__(tests|mocks|fixtures)__/,
  /\.(test|spec)\.(ts|tsx|js|jsx)$/,
];

// 기본 모델
const DEFAULT_MODELS: Record<AIProvider, string> = {
  openai: 'gpt-5.3',
  anthropic: 'claude-sonnet-4-5-20250929',
  google: 'gemini-3-pro',
};

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  /**
   * 프로바이더별 모델 인스턴스 생성
   */
  private getModel(options: AICompletionOptions) {
    const { provider, apiKey, model } = options;
    const modelId = model || DEFAULT_MODELS[provider];

    switch (provider) {
      case 'openai': {
        const openai = createOpenAI({ apiKey });
        return openai(modelId);
      }
      case 'anthropic': {
        const anthropic = createAnthropic({ apiKey });
        return anthropic(modelId);
      }
      case 'google': {
        const google = createGoogleGenerativeAI({ apiKey });
        return google(modelId);
      }
      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }
  }

  /**
   * 파일 우선순위 정렬 및 필터링
   */
  private prioritizeFiles(
    files: { filename: string; patch?: string }[],
  ): { filename: string; patch?: string }[] {
    const highPriority: typeof files = [];
    const lowPriority: typeof files = [];

    for (const file of files) {
      const isLowPriority = LOW_PRIORITY_PATTERNS.some((pattern) =>
        pattern.test(file.filename),
      );
      if (isLowPriority) {
        lowPriority.push(file);
      } else {
        highPriority.push(file);
      }
    }

    return [...highPriority, ...lowPriority];
  }

  /**
   * 파일 콘텐츠 압축/제한
   */
  private truncateFilesContent(
    files: { filename: string; patch?: string }[],
    options: { maxFiles?: number; maxPatchLength?: number; maxTotalLength?: number } = {},
  ): { files: { filename: string; patch?: string }[]; truncated: boolean; skippedCount: number } {
    const maxFiles = options.maxFiles ?? MAX_FILES;
    const maxPatchLength = options.maxPatchLength ?? MAX_PATCH_LENGTH;
    const maxTotalLength = options.maxTotalLength ?? MAX_TOTAL_CONTENT;

    const prioritizedFiles = this.prioritizeFiles(files);
    const result: { filename: string; patch?: string }[] = [];
    let totalLength = 0;
    let truncated = false;

    for (const file of prioritizedFiles) {
      if (result.length >= maxFiles) {
        truncated = true;
        break;
      }

      if (totalLength >= maxTotalLength) {
        truncated = true;
        break;
      }

      let patch = file.patch || '';

      if (patch.length > maxPatchLength) {
        patch = patch.substring(0, maxPatchLength) + '\n... (truncated)';
        truncated = true;
      }

      const fileContent = `${file.filename}\n${patch}`;
      if (totalLength + fileContent.length > maxTotalLength) {
        const remainingSpace = maxTotalLength - totalLength;
        if (remainingSpace > 100) {
          patch = patch.substring(0, remainingSpace - file.filename.length - 50) + '\n... (truncated)';
          truncated = true;
        } else {
          truncated = true;
          break;
        }
      }

      result.push({ filename: file.filename, patch });
      totalLength += file.filename.length + patch.length;
    }

    return {
      files: result,
      truncated,
      skippedCount: files.length - result.length,
    };
  }

  /**
   * 통합 AI 텍스트 생성
   */
  async complete(
    messages: AIMessage[],
    options: AICompletionOptions,
  ): Promise<string> {
    const model = this.getModel(options);

    const { text } = await generateText({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 4096,
    });

    return text;
  }

  /**
   * API 키 유효성 검증
   */
  async validateApiKey(provider: AIProvider, apiKey: string): Promise<boolean> {
    try {
      const options: AICompletionOptions = { provider, apiKey };
      const model = this.getModel(options);

      await generateText({
        model,
        messages: [{ role: 'user', content: 'Hi' }],
        maxOutputTokens: 1,
      });

      return true;
    } catch {
      return false;
    }
  }

  /**
   * 프롬프트 기반 간단한 완성
   */
  async prompt(
    systemPrompt: string,
    userPrompt: string,
    options: AICompletionOptions,
  ): Promise<string> {
    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    return this.complete(messages, options);
  }

  /**
   * PR 리뷰 생성
   */
  async generatePRReview(
    options: AICompletionOptions,
    prInfo: {
      title: string;
      description: string | null;
      files: { filename: string; patch?: string }[];
    },
  ): Promise<string> {
    const { files, truncated, skippedCount } = this.truncateFilesContent(prInfo.files);

    this.logger.log(
      `PR Review: ${prInfo.files.length} files → ${files.length} files (truncated: ${truncated}, skipped: ${skippedCount})`,
    );

    const systemPrompt = `You are an experienced code reviewer. Review the following pull request and provide constructive feedback.
Focus on:
- Code quality and best practices
- Potential bugs or issues
- Performance considerations
- Security concerns
- Suggestions for improvement

Be concise but thorough. Use markdown formatting.
Note: Some files or content may have been truncated due to size limits.`;

    const filesContent = files
      .map((f) => `### ${f.filename}\n\`\`\`diff\n${f.patch || 'No diff available'}\n\`\`\``)
      .join('\n\n');

    const truncationNotice = truncated
      ? `\n\n> ⚠️ Note: ${skippedCount} files were skipped and some diffs were truncated due to size limits.\n`
      : '';

    const userPrompt = `# Pull Request: ${prInfo.title}

## Description
${prInfo.description || 'No description provided'}
${truncationNotice}
## Changed Files (${files.length}/${prInfo.files.length})
${filesContent}

Please review this pull request.`;

    return this.prompt(systemPrompt, userPrompt, options);
  }

  /**
   * 데일리 스크럼 요약 생성
   */
  async generateDailyScrumSummary(
    options: AICompletionOptions,
    issues: { key: string; summary: string; assignee: string | null; status: string }[],
  ): Promise<string> {
    const systemPrompt = `You are a scrum master assistant. Summarize the current sprint progress based on the in-progress issues.
Provide:
- Brief overview of current work
- Any potential blockers or concerns
- Suggestions for the team

Keep it concise and actionable. Use bullet points.`;

    const issuesContent = issues
      .map((i) => `- ${i.key}: ${i.summary} (Assignee: ${i.assignee || 'Unassigned'}, Status: ${i.status})`)
      .join('\n');

    const userPrompt = `# Current In-Progress Issues

${issuesContent}

Please provide a daily scrum summary.`;

    return this.prompt(systemPrompt, userPrompt, options);
  }

  /**
   * DOD 체크리스트 검증
   */
  async checkDOD(
    options: AICompletionOptions,
    prInfo: {
      title: string;
      description: string | null;
      files: { filename: string; patch?: string }[];
    },
    checklist: { id: string; label: string; required: boolean }[],
  ): Promise<{ results: { id: string; passed: boolean; reason: string }[]; summary: string }> {
    const { files, truncated, skippedCount } = this.truncateFilesContent(prInfo.files, {
      maxFiles: 10,
      maxPatchLength: 500,
      maxTotalLength: 6000,
    });

    this.logger.log(
      `DOD Check: ${prInfo.files.length} files → ${files.length} files (truncated: ${truncated}, skipped: ${skippedCount})`,
    );

    const systemPrompt = `You are a quality assurance assistant. Check if the pull request meets the Definition of Done criteria.

For each checklist item, determine if it's satisfied based on the PR content and file changes.
Respond in JSON format:
{
  "results": [
    { "id": "item_id", "passed": true/false, "reason": "brief explanation" }
  ],
  "summary": "overall assessment"
}`;

    const filesContent = files
      .map((f) => {
        const patchPreview = f.patch
          ? `\n  \`\`\`diff\n  ${f.patch}\n  \`\`\``
          : '';
        return `- **${f.filename}**${patchPreview}`;
      })
      .join('\n');

    const checklistContent = checklist
      .map((c) => `- [${c.id}] ${c.label} (Required: ${c.required})`)
      .join('\n');

    const truncationNotice =
      skippedCount > 0 ? `\n> Note: ${skippedCount} additional files not shown.\n` : '';

    const userPrompt = `# Pull Request: ${prInfo.title}

## Description
${prInfo.description || 'No description provided'}

## Changed Files (${files.length}/${prInfo.files.length})
${filesContent}
${truncationNotice}
## DOD Checklist
${checklistContent}

Please check each item and respond in JSON format.`;

    const response = await this.prompt(systemPrompt, userPrompt, options);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.warn('Failed to parse DOD check response as JSON', error);
    }

    return {
      results: checklist.map((c) => ({
        id: c.id,
        passed: false,
        reason: 'Could not determine',
      })),
      summary: response,
    };
  }
}
