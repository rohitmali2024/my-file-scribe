import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Lock } from 'lucide-react';

export default function DemoNotice() {
  return (
    <Card className="mb-6 border-primary/50 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Code className="h-5 w-5" />
          Demo Mode Active
        </CardTitle>
        <CardDescription>
          The app is running in demo mode for testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-start gap-2 text-sm">
          <Lock className="h-4 w-4 mt-0.5 text-primary" />
          <div>
            <p className="font-medium">Demo Credentials:</p>
            <p className="text-muted-foreground">
              Email: <code className="bg-muted px-1 rounded">demo@filescribe.com</code>
            </p>
            <p className="text-muted-foreground">
              Password: <code className="bg-muted px-1 rounded">demo123</code>
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Note: Files are stored temporarily in browser storage. Set DEMO_MODE to false in src/lib/api.ts when your backend is ready.
        </p>
      </CardContent>
    </Card>
  );
}
