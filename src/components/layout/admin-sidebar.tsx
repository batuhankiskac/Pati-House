'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PawPrint, Home, Cat, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/cats', label: 'Manage Cats', icon: Cat },
  { href: '/admin/requests', label: 'Adoption Requests', icon: Mail },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-card border-r hidden md:block">
      <div className="flex h-16 items-center justify-center border-b">
         <Link href="/" className="flex items-center gap-2">
            <PawPrint className="h-8 w-8 text-accent" />
            <span className="text-2xl font-bold font-headline text-primary-foreground">
              Admin
            </span>
          </Link>
      </div>
      <nav className="p-4">
        <ul>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    isActive && 'bg-muted text-primary'
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
