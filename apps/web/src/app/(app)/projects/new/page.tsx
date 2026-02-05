import { ProjectWizard } from '@/components/projects/wizard';

export default function NewProjectPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Project</h1>
        <p className="text-muted-foreground">
          Set up a new project with sprint automation
        </p>
      </div>

      <ProjectWizard />
    </div>
  );
}
