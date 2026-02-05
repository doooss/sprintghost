'use client';

import Link from 'next/link';
import { Github, TicketCheck, MessageSquare, Sparkles, MoreVertical, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import type { Project } from '@/lib/api';

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const integrations = [
    { key: 'github', icon: Github, connected: !!project.githubOwner && !!project.githubRepo },
    { key: 'jira', icon: TicketCheck, connected: !!project.jiraHost },
    { key: 'slack', icon: MessageSquare, connected: project.slackWebhookConfigured },
    { key: 'ai', icon: Sparkles, connected: !!project.aiProvider },
  ];

  return (
    <Card className="group relative transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Link href={`/projects/${project.id}`} className="flex-1">
            <CardTitle className="line-clamp-1 text-lg">{project.name}</CardTitle>
            {project.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {project.description}
              </CardDescription>
            )}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/projects/${project.id}`}>View Details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete?.(project.id)}
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {integrations.map(({ key, icon: Icon, connected }) => (
            <Badge key={key} variant={connected ? 'default' : 'secondary'}>
              <Icon className="mr-1 size-3" />
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Badge>
          ))}
        </div>
        {project.githubOwner && project.githubRepo && (
          <p className="mt-3 text-xs text-muted-foreground">
            {project.githubOwner}/{project.githubRepo}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
