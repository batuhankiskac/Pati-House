'use client';

import Link from 'next/link';
import { PawPrint } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import SignOutForm from '@/components/auth/signout-form';

export default function Header() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Client-side'da cookie kontrolü
    const checkAuth = () => {
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
      setIsAuthenticated(!!authCookie);
    };

    checkAuth();

    // Path değiştiğinde tekrar kontrol et
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Ana Sayfa' },
    { href: '/admin', label: 'Admin' },
  ];

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
            {isAuthenticated && (
              <SignOutForm />
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
