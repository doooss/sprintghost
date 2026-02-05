import { Ghost } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Ghost className="size-4" />
          <span>SprintGhost</span>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Self-hosted sprint automation for your team.
        </p>
      </div>
    </footer>
  );
}
