import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Cat } from '@/lib/data';
import { Cake, Cat as CatIcon, Venus, Mars } from 'lucide-react';

interface CatCardProps {
  cat: Cat;
}

export default function CatCard({ cat }: CatCardProps) {
  return (
    <Link
      href={`/cats/${cat.id}`}
      className="block group"
      aria-label={`View details for ${cat.name}`}
    >
      <Card
        className="h-full flex flex-col transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:-translate-y-1"
        role="article"
        aria-labelledby={`cat-name-${cat.id}`}
      >
        <CardHeader className="p-0">
          <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
            <Image
              src={cat.image}
              alt={`Image of ${cat.name}, a ${cat.breed} cat`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              data-ai-hint={cat.dataAiHint}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4">
          <CardTitle
            id={`cat-name-${cat.id}`}
            className="text-xl font-headline mb-2"
          >
            {cat.name}
          </CardTitle>
          <div className="flex items-center text-sm text-muted-foreground gap-2">
            {cat.gender === 'Male' ? (
              <>
                <Mars className="h-4 w-4" aria-hidden="true" />
                <span>Erkek</span>
              </>
            ) : (
              <>
                <Venus className="h-4 w-4" aria-hidden="true" />
                <span>Dişi</span>
              </>
            )}
            <span className="text-muted-foreground/50" aria-hidden="true">|</span>
            <Cake className="h-4 w-4" aria-hidden="true" />
            <span>{cat.age} yaş</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
           <Badge variant="outline" className="flex items-center gap-1">
              <CatIcon className="h-3 w-3" aria-hidden="true" />
              {cat.breed}
            </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
