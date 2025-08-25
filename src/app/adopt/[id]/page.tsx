import { cats } from '@/lib/data';
import { notFound } from 'next/navigation';
import AdoptionForm from '@/components/adoption-form';
import { PawPrint } from 'lucide-react';

export default function AdoptPage({ params }: { params: { id: string } }) {
  const cat = cats.find((c) => c.id === parseInt(params.id, 10));

  if (!cat) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-8">
        <PawPrint className="mx-auto h-12 w-12 text-accent" />
        <h1 className="text-4xl font-headline font-bold mt-4">Adoption Application</h1>
        <p className="text-xl text-muted-foreground mt-2">
          You're taking the first step to adopt <span className="font-bold text-accent">{cat.name}</span>!
        </p>
      </div>
      <AdoptionForm catName={cat.name} />
    </div>
  );
}
