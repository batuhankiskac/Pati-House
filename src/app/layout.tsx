import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"
import Header from '@/components/layout/header';
import { auth } from '@/auth';

export const metadata: Metadata = {
  title: 'Pati House - Find Your Furry Friend',
  description: 'Adopt a cat from Pati House. We have lovely cats waiting for a warm home.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en" className="h-full">
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
        <div className="relative flex min-h-screen flex-col">
          <Header user={session?.user ?? null}/>
          <main className="flex-1">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
