'use client';

import { Loader2, CheckCircle, XCircle, Github, TicketCheck, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card';
import type { WizardData } from '../project-wizard';

interface StepReviewProps {
  data: WizardData;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function StepReview({ data, onBack, onSubmit, isSubmitting }: StepReviewProps) {
  const integrations = [
    {
      key: 'github',
      icon: Github,
      label: 'GitHub',
      configured: !!(data.githubOwner && data.githubRepo),
      details: data.githubOwner && data.githubRepo ? `${data.githubOwner}/${data.githubRepo}` : null,
    },
    {
      key: 'jira',
      icon: TicketCheck,
      label: 'Jira',
      configured: !!data.jiraHost,
      details: data.jiraHost
        ? `${data.jiraHost}${data.jiraProjectKey ? ` (${data.jiraProjectKey})` : ''}`
        : null,
    },
    {
      key: 'slack',
      icon: MessageSquare,
      label: 'Slack',
      configured: !!data.slackWebhookUrl,
      details: data.slackWebhookUrl ? 'Webhook configured' : null,
    },
    {
      key: 'ai',
      icon: Sparkles,
      label: 'AI Provider',
      configured: !!data.aiProvider,
      details: data.aiProvider
        ? `${data.aiProvider.charAt(0).toUpperCase() + data.aiProvider.slice(1)}${data.aiModel ? ` (${data.aiModel})` : ''}`
        : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Project Name</h3>
          <p className="text-muted-foreground">{data.name || 'Not specified'}</p>
        </div>

        {data.description && (
          <div>
            <h3 className="font-semibold">Description</h3>
            <p className="text-muted-foreground">{data.description}</p>
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Integrations</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {integrations.map(({ key, icon: Icon, label, configured, details }) => (
            <Card key={key} className={configured ? '' : 'opacity-60'}>
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4">
                <div
                  className={`flex size-10 items-center justify-center rounded-lg ${
                    configured ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="size-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    {label}
                    {configured ? (
                      <CheckCircle className="size-4 text-green-500" />
                    ) : (
                      <XCircle className="size-4 text-muted-foreground" />
                    )}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {details || 'Not configured'}
                  </p>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button type="button" onClick={onSubmit} disabled={isSubmitting || !data.name}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Project'
          )}
        </Button>
      </div>
    </div>
  );
}
