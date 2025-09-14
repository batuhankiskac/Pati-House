'use client';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {AlertCircle} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useState } from 'react';
import { ErrorBoundary } from '@/components/layout/error-boundary';
import { loginSchema } from '@/lib/validation/auth';
import { validateData } from '@/lib/validation/utils';
import type { LoginFormData } from '@/lib/validation/auth';

export function LoginForm() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form data
    const formData: LoginFormData = { username, password };
    const validationResult = validateData(loginSchema, formData);

    if (!validationResult.success) {
      setError('Please check your username and password.');
      setLoading(false);
      return;
    }

    const success = await login(username, password);

    if (!success) {
      setError('Invalid username or password');
    }

    setLoading(false);
  };

  return (
    <ErrorBoundary>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            required
          />
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </ErrorBoundary>
  );
}
