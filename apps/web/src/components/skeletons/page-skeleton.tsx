import { Skeleton } from '@repo/ui/components/skeleton';

export function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>
      <Skeleton className="h-9 w-32" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="container mx-autospace-y-8 px-4 py-8">
      <PageHeaderSkeleton />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-48" />
          <div className="grid gap-4 pt-4 md:grid-cols-2 lg:grid-cols-3">
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectsListSkeleton() {
  return (
    <div className="container mx-autospace-y-8 px-4 py-8">
      <PageHeaderSkeleton />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
      </div>
    </div>
  );
}

export function ProjectDetailSkeleton() {
  return (
    <div className="container mx-autospace-y-8 px-4 py-8">
      <div className="flex items-center gap-4">
        <Skeleton className="size-9" />
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
