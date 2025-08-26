import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"
import Header from '@/components/layout/header';
import { AuthProvider } from '@/contexts/auth-context';

export const metadata: Metadata = {
  title: 'Pati House - Tüylü Dostunuzu Bulun',
  description: 'Pati House\'tan bir kedi sahiplenin. Sıcak bir yuva bekleyen sevimli kedilerimiz var.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn(
          "h-full font-body antialiased",
        )}
      >
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
