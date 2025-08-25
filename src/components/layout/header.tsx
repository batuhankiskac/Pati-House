'use client';

import Link from 'next/link';
import { PawPrint, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/profile', label: 'Profile' },
  ];

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <PawPrint className="h-8 w-8 text-accent" />
            <span className="text-2xl font-bold font-headline text-primary-foreground">
              Pati House
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors hover:text-accent font-medium',
                  pathname === link.href ? 'text-accent' : 'text-foreground/80'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline">
              <UserCircle2 className="mr-2 h-4 w-4" />
              Login
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
