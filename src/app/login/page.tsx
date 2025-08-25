import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {PawPrint} from 'lucide-react';
import {LoginForm} from './login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <PawPrint className="mx-auto h-12 w-12 text-accent" />
          <h1 className="text-3xl font-headline font-bold mt-2">Pati House Admin</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Please enter the password to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
