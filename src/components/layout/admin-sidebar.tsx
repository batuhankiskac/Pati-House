'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, PawPrint, Home, Cat, Mail, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useAuth } from '@/contexts/auth-context';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

const navLinks = [
  { href: '/admin', label: 'Panel', icon: Home },
  { href: '/admin/cats', label: 'Kedileri Yönet', icon: Cat },
  { href: '/admin/requests', label: 'Sahiplenme Talepleri', icon: Mail },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (isMobile) {
    return (
      <div className="md:hidden p-4 border-b">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Menüyü aç">
              <Menu className="h-6 w-6" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <PawPrint className="h-6 w-6 text-accent" aria-hidden="true" />
                <span className="font-headline">Admin Paneli</span>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2 py-6">
              <ul>
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary my-1',
                          isActive && 'bg-muted text-primary'
                        )}
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={link.label}
                      >
                        <link.icon className="h-5 w-5" aria-hidden="true" />
                        <span className="text-lg">{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="mt-auto">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleSignOut}
                aria-label="Çıkış Yap"
              >
                <LogOut className="mr-2 h-5 w-5" aria-hidden="true" />
                <span className="text-lg">Çıkış Yap</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <aside
      className="w-64 flex-shrink-0 bg-card border-r hidden md:flex flex-col"
      role="navigation"
      aria-label="Admin navigation"
    >
      <div className="flex h-16 items-center justify-center border-b">
         <Link
           href="/"
           className="flex items-center gap-2"
           aria-label="Go to homepage"
         >
            <PawPrint className="h-8 w-8 text-accent" aria-hidden="true" />
            <span className="text-2xl font-bold font-headline text-primary-foreground">
              Admin
            </span>
          </Link>
      </div>
      <nav className="p-4 flex-grow">
        <ul>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary my-1',
                    isActive && 'bg-muted text-primary'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={link.label}
                >
                  <link.icon className="h-4 w-4" aria-hidden="true" />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleSignOut}
          aria-label="Çıkış Yap"
        >
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          Çıkış Yap
        </Button>
      </div>
    </aside>
  );
}
