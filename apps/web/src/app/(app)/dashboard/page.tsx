'use client';

import Link from 'next/link';
import { Plus, FolderKanban, Activity, AlertCircle } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@repo/ui/components/empty';
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/alert';
import { useProjects } from '@/hooks';
import { ProjectCard } from '@/components/projects';
import { ProjectCardSkeleton } from '@/components/skeletons';

export default function DashboardPage() {
  const { projects, isLoading, isError, error } = useProjects();

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your sprint automation</p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 size-4" />
            New Project
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Project Summary Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-12 animate-pulse rounded bg-muted" />
            ) : (
              <>
                <div className="text-2xl font-bold">{projects.length}</div>
                <p className="text-xs text-muted-foreground">Active projects with automation</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Activity Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Activity logs coming soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Section */}
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>Your registered projects with sprint automation</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </div>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Error loading projects</AlertTitle>
              <AlertDescription>
                {error?.message || 'Failed to load projects. Please try again.'}
              </AlertDescription>
            </Alert>
          ) : projects.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderKanban />
                </EmptyMedia>
                <EmptyTitle>No projects yet</EmptyTitle>
                <EmptyDescription>
                  Create your first project to start automating your sprints
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
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.slice(0, 6).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
