'use client';

import { useState, useCallback } from 'react';
import { integrationsApi } from '@/lib/api';
import type { GitHubValidationResult, GitHubRepository, JiraValidationResult } from '@/lib/api';

export function useGitHubValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<GitHubValidationResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const validate = useCallback(async (pat: string) => {
    setIsValidating(true);
    setError(null);
    try {
      const res = await integrationsApi.validateGitHubPat(pat);
      setResult(res);
      return res;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Validation failed'));
      setResult(null);
      return null;
    } finally {
      setIsValidating(false);
    }
  }, []);

  return { validate, isValidating, result, error };
}

export function useGitHubRepositories() {
  const [isLoading, setIsLoading] = useState(false);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const fetchRepositories = useCallback(async (pat: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const repos = await integrationsApi.listGitHubRepositories(pat);
      setRepositories(repos);
      return repos;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch repositories'));
      setRepositories([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchRepositories, isLoading, repositories, error };
}

export function useJiraValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<JiraValidationResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const validate = useCallback(
    async (config: { host: string; email: string; apiToken: string }) => {
      setIsValidating(true);
      setError(null);
      try {
        const res = await integrationsApi.validateJiraCredentials(config);
        setResult(res);
        return res;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Validation failed'));
        setResult(null);
        return null;
      } finally {
        setIsValidating(false);
      }
    },
    []
  );

  return { validate, isValidating, result, error };
}

export function useSlackValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const validate = useCallback(async (webhookUrl: string) => {
    setIsValidating(true);
    setError(null);
    try {
      const res = await integrationsApi.validateSlackWebhook(webhookUrl);
      setIsValid(res.valid);
      return res.valid;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Validation failed'));
      setIsValid(false);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const sendTestMessage = useCallback(async (webhookUrl: string) => {
    try {
      await integrationsApi.testSlackWebhook(webhookUrl);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { validate, sendTestMessage, isValidating, isValid, error };
}

export function useAiValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const validate = useCallback(async (provider: string, apiKey: string) => {
    setIsValidating(true);
    setError(null);
    try {
      const res = await integrationsApi.validateAiApiKey(provider, apiKey);
      setIsValid(res.valid);
      return res.valid;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Validation failed'));
      setIsValid(false);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, []);

  return { validate, isValidating, isValid, error };
}
