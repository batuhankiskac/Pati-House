'use client';

import Link from 'next/link';
import { Menu, PawPrint } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function Header() {
  const pathname = usePathname();
  const { isAuthenticated, logout, loading } = useAuth();

  const publicNavLinks = [
    { href: '/', label: 'Ana Sayfa' },
  ];

  const adminNavLinks = [
    { href: '/admin', label: 'Admin' },
  ];

  return (
    <header
      className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50"
      role="banner"
      aria-label="Ana başlık"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="Pati House ana sayfa"
          >
            <PawPrint className="h-8 w-8 text-accent" aria-hidden="true" />
            <span className="text-2xl font-bold font-headline text-primary-foreground">
              Pati House
            </span>
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                    'p-2'
                  )}
                  aria-label="Menüyü aç"
                >
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <PawPrint className="h-6 w-6 text-accent" aria-hidden="true" />
                    <span className="font-headline">Pati House</span>
                  </SheetTitle>
                </SheetHeader>
                <nav
                  className="flex flex-col gap-4 py-6"
                  role="navigation"
                  aria-label="Mobil navigasyon"
                >
                  {!loading && (
                    <>
                      {publicNavLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={cn(
                            buttonVariants({ variant: 'ghost', size: 'lg' }),
                            'justify-start',
                            (pathname.startsWith(link.href) && link.href !== '/') || pathname === link.href
                              ? 'bg-accent text-accent-foreground shadow-md'
                              : 'text-foreground/80 hover:bg-accent/80 hover:text-accent-foreground'
                          )}
                          aria-current={(pathname.startsWith(link.href) && link.href !== '/') || pathname === link.href ? 'page' : undefined}
                        >
                          {link.label}
                        </Link>
                      ))}
                      {isAuthenticated && adminNavLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={cn(
                            buttonVariants({ variant: 'ghost', size: 'lg' }),
                            'justify-start',
                            (pathname.startsWith(link.href) && link.href !== '/') || pathname === link.href
                              ? 'bg-accent text-accent-foreground shadow-md'
                              : 'text-foreground/80 hover:bg-accent/80 hover:text-accent-foreground'
                          )}
                          aria-current={(pathname.startsWith(link.href) && link.href !== '/') || pathname === link.href ? 'page' : undefined}
                        >
                          {link.label}
                        </Link>
                      ))}
                      {isAuthenticated && (
                        <button
                          onClick={logout}
                          className={cn(
                            buttonVariants({ variant: 'ghost', size: 'lg' }),
                            'justify-start text-foreground/80 hover:bg-accent/80 hover:text-accent-foreground'
                          )}
                          aria-label="Çıkış yap"
                        >
                          Çıkış Yap
                        </button>
                      )}
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop navigation */}
          <nav
            className="hidden md:flex items-center gap-4 text-sm"
            role="navigation"
            aria-label="Ana navigasyon"
          >
            {!loading && (
              <>
                {publicNavLinks.map((link) => (
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
                    aria-current={(pathname.startsWith(link.href) && link.href !== '/') || pathname === link.href ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated && adminNavLinks.map((link) => (
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
                    aria-current={(pathname.startsWith(link.href) && link.href !== '/') || pathname === link.href ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated && (
                  <button
                    onClick={logout}
                    className={cn(
                      buttonVariants({ variant: 'ghost', size: 'sm' }),
                      'text-foreground/80 hover:bg-accent/80 hover:text-accent-foreground'
                    )}
                    aria-label="Çıkış yap"
                  >
                    Çıkış Yap
                  </button>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
