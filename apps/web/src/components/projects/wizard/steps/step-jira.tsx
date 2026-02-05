'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Alert, AlertDescription } from '@repo/ui/components/alert';
import { RadioGroup, RadioGroupItem } from '@repo/ui/components/radio-group';
import { useJiraValidation } from '@/hooks';
import type { WizardData } from '../project-wizard';

interface StepJiraProps {
  data: WizardData;
  updateData: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepJira({ data, updateData, onNext, onBack }: StepJiraProps) {
  const [host, setHost] = useState(data.jiraHost || '');
  const [email, setEmail] = useState(data.jiraEmail || '');
  const [apiToken, setApiToken] = useState(data.jiraApiToken || '');
  const [projectKey, setProjectKey] = useState(data.jiraProjectKey || '');
  const [fallbackEnabled, setFallbackEnabled] = useState(data.jiraFallbackEnabled ?? true);
  const [fallbackDays, setFallbackDays] = useState(data.jiraFallbackDays ?? 7);

  const { validate, isValidating, result: validationResult } = useJiraValidation();

  const handleValidate = async () => {
    if (!host || !email || !apiToken) return;
    await validate({ host, email, apiToken });
  };

  const handleNext = () => {
    if (host && email && apiToken) {
      updateData({
        jiraHost: host,
        jiraEmail: email,
        jiraApiToken: apiToken,
        jiraProjectKey: projectKey || undefined,
        jiraFallbackEnabled: fallbackEnabled,
        jiraFallbackDays: fallbackDays,
      });
    }
    onNext();
  };

  const handleSkip = () => {
    updateData({
      jiraHost: undefined,
      jiraEmail: undefined,
      jiraApiToken: undefined,
      jiraProjectKey: undefined,
      jiraFallbackEnabled: undefined,
      jiraFallbackDays: undefined,
    });
    onNext();
  };

  const canValidate = host && email && apiToken;

  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription className="space-y-2">
          <p>Create a Jira API Token:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>
              <a
                href="https://id.atlassian.com/manage-profile/security/api-tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary underline"
              >
                Go to Atlassian API Tokens <ExternalLink className="size-3" />
              </a>
            </li>
            <li>Click "Create API token" and give it a label</li>
            <li>Copy the token (it won't be shown again)</li>
          </ol>
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="host">Jira URL</Label>
          <Input
            id="host"
            placeholder="https://your-company.atlassian.net"
            value={host}
            onChange={(e) => setHost(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your-email@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiToken">API Token</Label>
          <Input
            id="apiToken"
            type="password"
            placeholder="Your Jira API token"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="projectKey">Project Key (optional)</Label>
          <Input
            id="projectKey"
            placeholder="PROJ"
            value={projectKey}
            onChange={(e) => setProjectKey(e.target.value.toUpperCase())}
          />
        </div>

        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleValidate}
            disabled={!canValidate || isValidating}
            className="w-full"
          >
            {isValidating ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Test Connection
          </Button>
        </div>
      </div>

      {validationResult && (
        <div className="flex items-center gap-2 text-sm">
          {validationResult.valid ? (
            <>
              <CheckCircle className="size-4 text-green-500" />
              <span>Connected as {validationResult.user}</span>
            </>
          ) : (
            <>
              <XCircle className="size-4 text-destructive" />
              <span className="text-destructive">Connection failed. Check your credentials.</span>
            </>
          )}
        </div>
      )}

      {/* Sprint Fallback Settings */}
      <div className="space-y-4 rounded-lg border p-4">
        <Label className="text-sm font-medium">데일리 스크럼 대상</Label>
        <RadioGroup
          value={fallbackEnabled ? 'fallback' : 'sprint'}
          onValueChange={(value) => setFallbackEnabled(value === 'fallback')}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sprint" id="sprint-only" />
            <Label htmlFor="sprint-only" className="font-normal">
              활성 스프린트만
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fallback" id="with-fallback" />
            <Label htmlFor="with-fallback" className="font-normal">
              활성 스프린트 (없으면 최근 이슈)
            </Label>
          </div>
        </RadioGroup>

        {fallbackEnabled && (
          <div className="ml-6 space-y-2">
            <Label htmlFor="fallbackDays" className="text-sm">
              Fallback 조회 기간
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="fallbackDays"
                type="number"
                min={1}
                max={30}
                value={fallbackDays}
                onChange={(e) => setFallbackDays(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">일</span>
            </div>
            <p className="text-xs text-muted-foreground">
              활성 스프린트가 없을 때 최근 업데이트된 이슈를 조회할 기간
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={handleSkip}>
            Skip
          </Button>
          <Button type="button" onClick={handleNext}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
