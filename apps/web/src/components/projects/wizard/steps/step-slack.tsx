'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Loader2, ExternalLink, Send } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Alert, AlertDescription } from '@repo/ui/components/alert';
import { useSlackValidation } from '@/hooks';
import { toast } from '@/lib/toast';
import type { WizardData } from '../project-wizard';

interface StepSlackProps {
  data: WizardData;
  updateData: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepSlack({ data, updateData, onNext, onBack }: StepSlackProps) {
  const [webhookUrl, setWebhookUrl] = useState(data.slackWebhookUrl || '');
  const [isSendingTest, setIsSendingTest] = useState(false);

  const { validate, isValidating, isValid } = useSlackValidation();

  const handleValidate = async () => {
    if (!webhookUrl) return;
    await validate(webhookUrl);
  };

  const handleSendTest = async () => {
    if (!webhookUrl) return;
    setIsSendingTest(true);
    try {
      // For now, just validate the URL format
      const url = new URL(webhookUrl);
      if (url.host.includes('slack.com') || url.host.includes('hooks.slack.com')) {
        toast.success('Test message would be sent here');
      } else {
        toast.error('Invalid Slack webhook URL');
      }
    } catch {
      toast.error('Invalid URL format');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleNext = () => {
    if (webhookUrl) {
      updateData({ slackWebhookUrl: webhookUrl });
    }
    onNext();
  };

  const handleSkip = () => {
    updateData({ slackWebhookUrl: undefined });
    onNext();
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription className="space-y-2">
          <p>Create an Incoming Webhook for your Slack workspace:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>
              <a
                href="https://api.slack.com/apps?new_app=1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary underline"
              >
                Create a Slack App <ExternalLink className="size-3" />
              </a>
            </li>
            <li>Go to "Incoming Webhooks" and activate it</li>
            <li>Click "Add New Webhook to Workspace" and select a channel</li>
            <li>Copy the Webhook URL</li>
          </ol>
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="webhookUrl">Slack Webhook URL</Label>
        <Input
          id="webhookUrl"
          type="url"
          placeholder="https://hooks.slack.com/services/..."
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
        />
        {isValid !== null && (
          <div className="flex items-center gap-2 text-sm">
            {isValid ? (
              <>
                <CheckCircle className="size-4 text-green-500" />
                <span>Valid webhook URL</span>
              </>
            ) : (
              <>
                <XCircle className="size-4 text-destructive" />
                <span className="text-destructive">Invalid webhook URL</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleValidate}
          disabled={!webhookUrl || isValidating}
        >
          {isValidating ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          Validate
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleSendTest}
          disabled={!webhookUrl || isSendingTest}
        >
          {isSendingTest ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Send className="mr-2 size-4" />
          )}
          Send Test
        </Button>
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
