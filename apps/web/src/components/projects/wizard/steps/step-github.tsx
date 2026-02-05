'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Alert, AlertDescription } from '@repo/ui/components/alert';
import { useGitHubValidation, useGitHubRepositories } from '@/hooks';
import type { WizardData } from '../project-wizard';

const schema = z.object({
  githubPat: z.string().optional(),
  githubRepo: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface StepGitHubProps {
  data: WizardData;
  updateData: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepGitHub({ data, updateData, onNext, onBack }: StepGitHubProps) {
  const [pat, setPat] = useState(data.githubPat || '');
  const [selectedRepo, setSelectedRepo] = useState(
    data.githubOwner && data.githubRepo ? `${data.githubOwner}/${data.githubRepo}` : ''
  );

  const { validate, isValidating, result: validationResult } = useGitHubValidation();
  const { fetchRepositories, isLoading: isLoadingRepos, repositories } = useGitHubRepositories();

  const handleValidate = async () => {
    if (!pat) return;
    const result = await validate(pat);
    if (result?.valid) {
      await fetchRepositories(pat);
    }
  };

  const handleNext = () => {
    if (selectedRepo) {
      const [owner, repo] = selectedRepo.split('/');
      updateData({
        githubPat: pat,
        githubOwner: owner,
        githubRepo: repo,
      });
    }
    onNext();
  };

  const handleSkip = () => {
    updateData({
      githubPat: undefined,
      githubOwner: undefined,
      githubRepo: undefined,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription className="space-y-2">
          <p>Create a GitHub Personal Access Token (PAT):</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=SprintGhost"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary underline"
              >
                Create PAT (Classic) <ExternalLink className="size-3" />
              </a>{' '}
              with <code className="rounded bg-muted px-1">repo</code> scope
            </li>
            <li>Or use{' '}
              <a
                href="https://github.com/settings/personal-access-tokens/new"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary underline"
              >
                Fine-grained PAT <ExternalLink className="size-3" />
              </a>{' '}
              with repository read/write access
            </li>
          </ol>
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="pat">GitHub Personal Access Token</Label>
        <div className="flex gap-2">
          <Input
            id="pat"
            type="password"
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            value={pat}
            onChange={(e) => setPat(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleValidate}
            disabled={!pat || isValidating}
          >
            {isValidating ? <Loader2 className="size-4 animate-spin" /> : 'Validate'}
          </Button>
        </div>
        {validationResult && (
          <div className="flex items-center gap-2 text-sm">
            {validationResult.valid ? (
              <>
                <CheckCircle className="size-4 text-green-500" />
                <span>Authenticated as {validationResult.user}</span>
              </>
            ) : (
              <>
                <XCircle className="size-4 text-destructive" />
                <span className="text-destructive">Invalid token</span>
              </>
            )}
          </div>
        )}
      </div>

      {repositories.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="repo">Repository</Label>
          <Select value={selectedRepo} onValueChange={setSelectedRepo}>
            <SelectTrigger>
              <SelectValue placeholder="Select a repository" />
            </SelectTrigger>
            <SelectContent>
              {repositories.map((repo) => (
                <SelectItem key={repo.full_name} value={repo.full_name}>
                  {repo.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={handleSkip}>
            Skip
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={!selectedRepo && !validationResult?.valid}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
