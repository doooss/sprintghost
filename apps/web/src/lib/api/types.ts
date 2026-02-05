export interface DodChecklistItem {
  id: string;
  label: string;
  required?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;

  // GitHub
  githubOwner?: string | null;
  githubRepo?: string | null;

  // Jira
  jiraHost?: string | null;
  jiraProjectKey?: string | null;

  // Slack
  slackWebhookConfigured?: boolean;

  // AI
  aiProvider?: 'openai' | 'anthropic' | 'google' | null;
  aiModel?: string | null;

  // Webhook
  webhookKey?: string;

  // DOD
  dodChecklist?: DodChecklistItem[] | null;

  // Daily Scrum
  dailyScrumEnabled?: boolean;
  dailyScrumCron?: string | null;
  dailyScrumTimezone?: string | null;

  // Jira Sprint Fallback
  jiraFallbackEnabled?: boolean;
  jiraFallbackDays?: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;

  // GitHub
  githubPat?: string;
  githubOwner?: string;
  githubRepo?: string;

  // Jira
  jiraHost?: string;
  jiraEmail?: string;
  jiraApiToken?: string;
  jiraProjectKey?: string;

  // Slack
  slackWebhookUrl?: string;

  // AI
  aiProvider?: 'openai' | 'anthropic' | 'google';
  aiApiKey?: string;
  aiModel?: string;

  // DOD
  dodChecklist?: DodChecklistItem[];

  // Daily Scrum
  dailyScrumEnabled?: boolean;
  dailyScrumCron?: string;
  dailyScrumTimezone?: string;

  // Jira Sprint Fallback
  jiraFallbackEnabled?: boolean;
  jiraFallbackDays?: number;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {}

export interface CreateProjectResponse extends Project {
  webhookKey: string;
}

// GitHub validation
export interface GitHubValidationResult {
  valid: boolean;
  user?: string;
  scopes?: string[];
}

export interface GitHubRepository {
  owner: string;
  name: string;
  full_name: string;
}

// Jira validation
export interface JiraValidationResult {
  valid: boolean;
  user?: string;
}

// Activity Log
export interface ActivityLog {
  id: string;
  projectId: string;
  type: 'PR_REVIEW' | 'PR_MERGED' | 'DAILY_SCRUM' | 'DOD_CHECK' | 'PROJECT_CREATED' | 'PROJECT_UPDATED';
  data: Record<string, unknown>;
  createdAt: string;
}
