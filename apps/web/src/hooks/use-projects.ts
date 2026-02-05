'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { projectsApi } from '@/lib/api';
import type { CreateProjectDto, UpdateProjectDto } from '@/lib/api';

// Fetcher for SWR
const fetcher = {
  list: () => projectsApi.list(),
  get: (id: string) => projectsApi.get(id),
};

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR('projects', fetcher.list);

  return {
    projects: data ?? [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

export function useProject(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `projects/${id}` : null,
    () => (id ? fetcher.get(id) : null)
  );

  return {
    project: data ?? null,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

export function useCreateProject() {
  const { trigger, isMutating, error } = useSWRMutation(
    'projects',
    async (_key: string, { arg }: { arg: CreateProjectDto }) => {
      return projectsApi.create(arg);
    }
  );

  return {
    createProject: trigger,
    isCreating: isMutating,
    error,
  };
}

export function useUpdateProject(id: string) {
  const { trigger, isMutating, error } = useSWRMutation(
    `projects/${id}`,
    async (_key: string, { arg }: { arg: UpdateProjectDto }) => {
      return projectsApi.update(id, arg);
    }
  );

  return {
    updateProject: trigger,
    isUpdating: isMutating,
    error,
  };
}

export function useDeleteProject() {
  const { trigger, isMutating, error } = useSWRMutation(
    'projects',
    async (_key: string, { arg }: { arg: string }) => {
      await projectsApi.delete(arg);
      return arg;
    }
  );

  return {
    deleteProject: trigger,
    isDeleting: isMutating,
    error,
  };
}
