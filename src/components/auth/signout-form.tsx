'use client';

import { signOut } from '@/actions/auth';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFormStatus } from 'react-dom';

function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'sm' }),
        'text-foreground/80 hover:bg-accent/80 hover:text-accent-foreground'
      )}
    >
      {pending ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
    </button>
  );
}

export default function SignOutForm() {
  return (
    <form action={signOut}>
      <SignOutButton />
    </form>
  );
}
