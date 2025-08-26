'use client';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {authenticate} from '@/actions/auth';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {AlertCircle} from 'lucide-react';

export function LoginForm() {
  const [state, formAction] = useActionState(authenticate, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Şifre</Label>
        <Input
          id="password"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
      </div>
      {state && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Hata</AlertTitle>
          <AlertDescription>{state}</AlertDescription>
        </Alert>
      )}
      <LoginButton />
    </form>
  );
}

function LoginButton() {
  const {pending} = useFormStatus();

  return (
    <Button type="submit" className="w-full" aria-disabled={pending}>
      {pending ? 'Giriş yapılıyor...' : 'Giriş Yap'}
    </Button>
  );
}
