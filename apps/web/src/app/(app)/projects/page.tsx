import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { ProjectsList } from '@/components/projects';

export default function ProjectsPage() {
  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your sprint automation projects</p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 size-4" />
            New Project
          </Link>
        </Button>
      </div>

      <ProjectsList />
    </div>
  );
}
