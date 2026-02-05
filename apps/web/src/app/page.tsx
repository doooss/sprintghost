import Link from 'next/link';
import { Ghost, ArrowRight, Zap, GitPullRequest, MessageSquare } from 'lucide-react';
import { Button } from '@repo/ui/components/button';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <header className="container mx-auto flex h-14 items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <Ghost className="size-6" />
          <span className="font-bold">SprintGhost</span>
        </Link>
        <div className="ml-auto">
          <Button asChild>
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="container mx-auto flex flex-col items-center gap-8 px-4 py-24 text-center md:py-32">
          <div className="flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm">
            <Zap className="size-4" />
            <span>Self-hosted sprint automation</span>
          </div>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            Automate Your Sprint Workflow with{' '}
            <span className="text-primary">SprintGhost</span>
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground">
            Connect GitHub, Jira, and Slack to automate PR reviews, daily scrums, and sprint
            management. Self-hosted for complete control over your data.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Start Now
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="https://github.com/doooss/sprintghost" target="_blank">
                View on GitHub
              </Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/50 py-24">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Features</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <FeatureCard
                icon={GitPullRequest}
                title="PR Scrum Review"
                description="Automatically analyze PRs against Jira issues and DOD checklists when opened."
              />
              <FeatureCard
                icon={MessageSquare}
                title="Daily Scrum"
                description="Get daily sprint summaries in Slack with AI-powered insights."
              />
              <FeatureCard
                icon={Zap}
                title="PR Merge Actions"
                description="Automate Jira transitions and Slack notifications when PRs are merged."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Ghost className="size-4" />
            <span>SprintGhost</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Self-hosted sprint automation for your team.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-background p-6">
      <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-6 text-primary" />
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
