import { api } from './client';
import type {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  CreateProjectResponse,
  GitHubValidationResult,
  GitHubRepository,
  JiraValidationResult,
  ActivityLog,
} from './types';

export const projectsApi = {
  // Projects CRUD
  list: () => api.get<Project[]>('/projects'),

  get: (id: string) => api.get<Project>(`/projects/${id}`),

  create: (data: CreateProjectDto) => api.post<CreateProjectResponse>('/projects', data),

  update: (id: string, data: UpdateProjectDto) => api.put<Project>(`/projects/${id}`, data),

  delete: (id: string) => api.delete<void>(`/projects/${id}`),

  getWebhookKey: (id: string) => api.get<{ webhookKey: string }>(`/projects/${id}/webhook-key`),

  regenerateWebhookKey: (id: string) =>
    api.post<{ webhookKey: string }>(`/projects/${id}/regenerate-webhook-key`),

  // Activity Logs
  getActivities: (id: string, limit = 20, offset = 0) =>
    api.get<ActivityLog[]>(`/projects/${id}/activities?limit=${limit}&offset=${offset}`),
};

export const integrationsApi = {
  // GitHub
  validateGitHubPat: (pat: string) =>
    api.post<GitHubValidationResult>('/integrations/github/validate', { pat }),

  listGitHubRepositories: (pat: string) =>
    api.post<GitHubRepository[]>('/integrations/github/repositories', { pat }),

  // Jira
  validateJiraCredentials: (config: { host: string; email: string; apiToken: string }) =>
    api.post<JiraValidationResult>('/integrations/jira/validate', config),

  // Slack
  validateSlackWebhook: (webhookUrl: string) =>
    api.post<{ valid: boolean }>('/integrations/slack/validate', { webhookUrl }),

  testSlackWebhook: (webhookUrl: string) =>
    api.post<void>('/integrations/slack/test', { webhookUrl }),

  // AI
  validateAiApiKey: (provider: string, apiKey: string) =>
    api.post<{ valid: boolean }>('/integrations/ai/validate', { provider, apiKey }),
};
