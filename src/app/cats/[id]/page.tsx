import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Cake, Cat as CatIcon, Venus, Mars } from 'lucide-react';
import { Cat } from '@/lib/data';

/**
 * Simplified dynamic cat page.
 * Previous fetch-based version failed (TypeError: Failed to parse URL) due to
 * relative fetch in a context requiring absolute URL. We revert to direct
 * in-memory access but force dynamic rendering so new cats (pushed by API)
 * are visible on each request.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CatProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = Number(id);

  // API'den kedi verisini çek
  let cat: Cat | null = null;
  try {
    // Geliştirme sunucusunun adresini al
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL ? process.env.VERCEL_URL : 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    const res = await fetch(`${baseUrl}/api/cats/${idNum}`, {
      cache: 'no-store' // Önbelleği devre dışı bırak
    });

    if (res.ok) {
      const data = await res.json();
      cat = data.data;
    }
  } catch (error) {
    console.error('Kedi verisi çekilirken hata oluştu:', error);
  }

  if (!cat) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        <div className="animate-fade-in">
          <Card className="overflow-hidden shadow-lg">
            <div className="relative w-full h-96">
              <Image
                src={cat.image}
                alt={`Photo of ${cat.name}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                data-ai-hint={cat.dataAiHint}
              />
            </div>
          </Card>
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <h1 className="text-5xl font-headline font-bold mb-2">{cat.name}</h1>
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="secondary" className="text-base">
              {cat.gender === 'Male' ? <Mars className="mr-2 h-4 w-4" /> : <Venus className="mr-2 h-4 w-4" />}
              {cat.gender === 'Male' ? 'Erkek' : 'Dişi'}
            </Badge>
            <Badge variant="secondary" className="text-base">
              <Cake className="mr-2 h-4 w-4" />
              {cat.age} yaşında
            </Badge>
            <Badge variant="secondary" className="text-base">
              <CatIcon className="mr-2 h-4 w-4" />
              {cat.breed}
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{cat.name} Hakkında</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed text-foreground/90">
                {cat.description}
              </p>
              <Button asChild size="lg" className="mt-8 w-full sm:w-auto bg-accent hover:bg-accent/90">
                <Link href={`/adopt/${cat.id}`}>{cat.name}'i Sahiplen</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Ensure fade-in animation is available

