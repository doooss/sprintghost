'use client';

import { useState } from 'react';
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
import { useAiValidation } from '@/hooks';
import type { WizardData } from '../project-wizard';

const AI_PROVIDERS = [
  { value: 'openai', label: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'] },
  { value: 'anthropic', label: 'Anthropic', models: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022'] },
  { value: 'google', label: 'Google', models: ['gemini-1.5-pro', 'gemini-1.5-flash'] },
] as const;

interface StepAIProps {
  data: WizardData;
  updateData: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepAI({ data, updateData, onNext, onBack }: StepAIProps) {
  const [provider, setProvider] = useState<string>(data.aiProvider || '');
  const [apiKey, setApiKey] = useState(data.aiApiKey || '');
  const [model, setModel] = useState(data.aiModel || '');

  const { validate, isValidating, isValid } = useAiValidation();

  const selectedProvider = AI_PROVIDERS.find((p) => p.value === provider);

  const handleProviderChange = (value: string) => {
    setProvider(value);
    setModel('');
  };

  const handleValidate = async () => {
    if (!provider || !apiKey) return;
    await validate(provider, apiKey);
  };

  const handleNext = () => {
    if (provider && apiKey) {
      updateData({
        aiProvider: provider as 'openai' | 'anthropic' | 'google',
        aiApiKey: apiKey,
        aiModel: model || undefined,
      });
    }
    onNext();
  };

  const handleSkip = () => {
    updateData({
      aiProvider: undefined,
      aiApiKey: undefined,
      aiModel: undefined,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription className="space-y-2">
          <p>Configure an AI provider for PR reviews and daily scrum summaries (optional).</p>
          <p className="text-sm">Get your API key:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary underline"
              >
                OpenAI API Keys <ExternalLink className="size-3" />
              </a>
            </li>
            <li>
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary underline"
              >
                Anthropic API Keys <ExternalLink className="size-3" />
              </a>
            </li>
            <li>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary underline"
              >
                Google AI API Keys <ExternalLink className="size-3" />
              </a>
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="provider">AI Provider</Label>
          <Select value={provider} onValueChange={handleProviderChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a provider" />
            </SelectTrigger>
            <SelectContent>
              {AI_PROVIDERS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Select value={model} onValueChange={setModel} disabled={!provider}>
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {selectedProvider?.models.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="apiKey">API Key</Label>
          <div className="flex gap-2">
            <Input
              id="apiKey"
              type="password"
              placeholder={`Your ${selectedProvider?.label || 'AI'} API key`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleValidate}
              disabled={!provider || !apiKey || isValidating}
            >
              {isValidating ? <Loader2 className="size-4 animate-spin" /> : 'Validate'}
            </Button>
          </div>
          {isValid !== null && (
            <div className="flex items-center gap-2 text-sm">
              {isValid ? (
                <>
                  <CheckCircle className="size-4 text-green-500" />
                  <span>API key is valid</span>
                </>
              ) : (
                <>
                  <XCircle className="size-4 text-destructive" />
                  <span className="text-destructive">Invalid API key</span>
                </>
              )}
            </div>
          )}
        </div>
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
