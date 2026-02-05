'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Settings,
  Github,
  TicketCheck,
  MessageSquare,
  Sparkles,
  CheckCircle,
  XCircle,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/alert';
import { useProject } from '@/hooks';
import { ProjectDetailSkeleton } from '@/components/skeletons';
import { toast } from '@/lib/toast';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params);
  const { project, isLoading, isError, error } = useProject(id);
  const [showWebhookKey, setShowWebhookKey] = useState(false);

  const copyWebhookKey = () => {
    if (project?.webhookKey) {
      navigator.clipboard.writeText(project.webhookKey);
      toast.success('Webhook key copied to clipboard');
    }
  };

  if (isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (isError || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertTitle>Project not found</AlertTitle>
            <AlertDescription>
              {error?.message || `The project with ID "${id}" could not be found.`}
            </AlertDescription>
          </Alert>
          <Button asChild variant="outline">
            <Link href="/projects">
              <ArrowLeft className="mr-2 size-4" />
              Back to Projects
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/projects">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href={`/projects/${id}/settings`}>
            <Settings className="mr-2 size-4" />
            Settings
          </Link>
        </Button>
      </div>

      {/* Webhook Key */}
      {project.webhookKey && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Webhook Key</CardTitle>
            <CardDescription>
              Use this key in your GitHub Actions workflow to identify this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-muted px-3 py-2 font-mono text-sm">
                {showWebhookKey ? project.webhookKey : '••••••••••••••••••••••••'}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowWebhookKey(!showWebhookKey)}
              >
                {showWebhookKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={copyWebhookKey}>
                <Copy className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* GitHub Integration */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Github className="size-5" />
                GitHub
              </CardTitle>
              <CardDescription>Repository connection</CardDescription>
            </div>
            <IntegrationBadge connected={!!(project.githubOwner && project.githubRepo)} />
          </CardHeader>
          <CardContent>
            {project.githubOwner && project.githubRepo ? (
              <p className="font-mono text-sm">
                {project.githubOwner}/{project.githubRepo}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Not configured</p>
            )}
          </CardContent>
        </Card>

        {/* Jira Integration */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TicketCheck className="size-5" />
                Jira
              </CardTitle>
              <CardDescription>Project connection</CardDescription>
            </div>
            <IntegrationBadge connected={!!project.jiraHost} />
          </CardHeader>
          <CardContent>
            {project.jiraHost ? (
              <div className="space-y-1">
                <p className="text-sm">{project.jiraHost}</p>
                {project.jiraProjectKey && (
                  <p className="text-sm text-muted-foreground">
                    Project: {project.jiraProjectKey}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not configured</p>
            )}
          </CardContent>
        </Card>

        {/* Slack Integration */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="size-5" />
                Slack
              </CardTitle>
              <CardDescription>Webhook notifications</CardDescription>
            </div>
            <IntegrationBadge connected={!!project.slackWebhookConfigured} />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {project.slackWebhookConfigured ? 'Webhook configured' : 'Not configured'}
            </p>
          </CardContent>
        </Card>

        {/* AI Integration */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5" />
                AI Provider
              </CardTitle>
              <CardDescription>AI-powered analysis</CardDescription>
            </div>
            <IntegrationBadge connected={!!project.aiProvider} />
          </CardHeader>
          <CardContent>
            {project.aiProvider ? (
              <div className="space-y-1">
                <p className="text-sm capitalize">{project.aiProvider}</p>
                {project.aiModel && (
                  <p className="text-sm text-muted-foreground">{project.aiModel}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not configured</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Scrum Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Scrum</CardTitle>
          <CardDescription>Automated daily scrum notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant={project.dailyScrumEnabled ? 'default' : 'secondary'}>
              {project.dailyScrumEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
            {project.dailyScrumCron && (
              <span className="text-sm text-muted-foreground">
                Schedule: <code className="rounded bg-muted px-1">{project.dailyScrumCron}</code>
              </span>
            )}
            {project.dailyScrumTimezone && (
              <span className="text-sm text-muted-foreground">
                Timezone: {project.dailyScrumTimezone}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function IntegrationBadge({ connected }: { connected: boolean }) {
  return connected ? (
    <Badge variant="default" className="gap-1">
      <CheckCircle className="size-3" />
      Connected
    </Badge>
  ) : (
    <Badge variant="secondary" className="gap-1">
      <XCircle className="size-3" />
      Not Connected
    </Badge>
  );
}
