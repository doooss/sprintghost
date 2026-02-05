'use client';

import Link from 'next/link';
import { Plus, FolderKanban, AlertCircle } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/alert';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@repo/ui/components/empty';
import { useProjects, useDeleteProject } from '@/hooks';
import { ProjectCard } from './project-card';
import { ProjectCardSkeleton } from '@/components/skeletons';
import { toast } from '@/lib/toast';

export function ProjectsList() {
  const { projects, isLoading, isError, error, refresh } = useProjects();
  const { deleteProject, isDeleting } = useDeleteProject();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await deleteProject(id);
      toast.success('Project deleted successfully');
      refresh();
    } catch {
      toast.error('Failed to delete project');
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Error loading projects</AlertTitle>
        <AlertDescription>
          {error?.message || 'Failed to load projects. Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  if (projects.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderKanban />
          </EmptyMedia>
          <EmptyTitle>No projects yet</EmptyTitle>
          <EmptyDescription>
            Create your first project to get started with sprint automation
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="mr-2 size-4" />
              Create Project
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onDelete={isDeleting ? undefined : handleDelete}
        />
      ))}
    </div>
  );
}
