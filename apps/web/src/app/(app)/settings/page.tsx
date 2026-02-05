import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-3xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Basic application configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Settings will be available here in future updates.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>Application information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span className="font-mono">0.1.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mode</span>
            <span className="font-mono">Single-User</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
