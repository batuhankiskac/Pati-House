import { notFound } from 'next/navigation';
import AdoptionForm from '@/components/adoption-form';
import { PawPrint } from 'lucide-react';
import { Cat } from '@/lib/data';

export default async function AdoptPage({ params }: { params: Promise<{ id: string }> }) {
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
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-8">
        <PawPrint className="mx-auto h-12 w-12 text-accent" />
        <h1 className="text-4xl font-headline font-bold mt-4">Sahiplenme Başvurusu</h1>
        <p className="text-xl text-muted-foreground mt-2">
          <span className="font-bold text-accent">{cat.name}</span>'i sahiplenmek için ilk adımı atıyorsunuz!
        </p>
      </div>
      <AdoptionForm catName={cat.name} />
    </div>
  );
}
