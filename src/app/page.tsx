'use client';

import React, { useState, useMemo } from 'react';
import CatCard from '@/components/cat-card';
import CatFilters from '@/components/cat-filters';
import { cats as allCats, type Cat } from '@/lib/data';
import { PawPrint } from 'lucide-react';

export default function Home() {
  const [cats, setCats] = useState<Cat[]>(allCats);
  const [filters, setFilters] = useState({
    search: '',
    breed: 'all',
    age: 'all',
    gender: 'all',
  });

  const filteredCats = useMemo(() => {
    return cats.filter((cat) => {
      const { search, breed, age, gender } = filters;
      if (search && !cat.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (breed !== 'all' && cat.breed !== breed) {
        return false;
      }
      if (age !== 'all') {
        if (age === 'kitten' && cat.age >= 1) return false;
        if (age === 'adult' && (cat.age < 1 || cat.age >= 8)) return false;
        if (age === 'senior' && cat.age < 8) return false;
      }
      if (gender !== 'all' && cat.gender !== gender) {
        return false;
      }
      return true;
    });
  }, [cats, filters]);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-accent mb-4">
          Find Your New Best Friend
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-foreground/80">
          Welcome to Pati House! We are dedicated to finding loving homes for cats in need. Browse our available cats and start your adoption journey today.
        </p>
      </section>

      <CatFilters filters={filters} onFilterChange={setFilters} />

      {filteredCats.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredCats.map((cat, index) => (
            <div
              key={cat.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CatCard cat={cat} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
           <PawPrint className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-2xl font-headline font-semibold text-foreground">No Cats Found</h2>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search filters to find more furry friends.
          </p>
        </div>
      )}
    </div>
  );
}

// Add fade-in animation to globals.css if it is not there
// Or we can add it in tailwind.config.js
// in globals.css
/*
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
  opacity: 0;
}
*/
// in tailwind.config.ts
/*
 theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
*/
