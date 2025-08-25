'use client';

import Link from 'next/link';
import { PawPrint } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { auth } from '@/auth';
import { signOut } from 'next-auth/react';
import {type User} from 'next-auth';


export default function Header({user}: {user: User | null}) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Ana Sayfa' },
    { href: '/admin', label: 'Admin' },
  ];

  const SignOut = () => {
    return (
      <form
        action={async () => {
          await signOut();
        }}
      >
        <button
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'transition-all duration-300',
            'text-foreground/80 hover:bg-accent/80 hover:text-accent-foreground'
          )}
        >
          Çıkış Yap
        </button>
      </form>
    );
  };

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <PawPrint className="h-8 w-8 text-accent" />
            <span className="text-2xl font-bold font-headline text-primary-foreground">
              Pati Evi
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'transition-all duration-300',
                  (pathname.startsWith(link.href) && link.href !== '/') || pathname === link.href
                    ? 'bg-accent text-accent-foreground shadow-md'
                    : 'text-foreground/80 hover:bg-accent/80 hover:text-accent-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
            {user && <SignOut />}
          </nav>
        </div>
      </div>
    </header>
  );
}
