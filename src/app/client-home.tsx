'use client';

import React, { useState, useMemo } from 'react';
import CatCard from '@/components/cat-card';
import CatFilters from '@/components/cat-filters';
import { type Cat } from '@/lib/data';
import { PawPrint } from 'lucide-react';
import { useCats } from '@/hooks/use-cats';
import TestErrorComponent from '@/components/test-error-component';

export default function ClientHomePage() {
  const { cats: allCats } = useCats();
  const [filters, setFilters] = useState({
    search: '',
    breed: 'all',
    age: 'all',
    gender: 'all',
  });

  const filteredCats = useMemo(() => {
    return allCats.filter((cat) => {
      const { search, breed, age, gender } = filters;
      if (search && !cat.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (breed !== 'all' && cat.breed !== breed) {
        return false;
      }
      if (age !== 'all') {
        if (age === 'yavru' && cat.age >= 1) return false;
        if (age === 'yetişkin' && (cat.age < 1 || cat.age >= 8)) return false;
        if (age === 'yaşlı' && cat.age < 8) return false;
      }
      if (gender !== 'all' && cat.gender !== gender) {
        return false;
      }
      return true;
    });
  }, [filters, allCats]);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-accent mb-4">
          Yeni En İyi Arkadaşınızı Bulun
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-foreground/80">
          Pati House'a hoş geldiniz! İhtiyaç sahibi kedilere sevgi dolu yuvalar bulmaya adandık. Mevcut kedilerimize göz atın ve sahiplenme yolculuğunuza bugün başlayın.
        </p>
      </section>

      {/* Test error component for verifying error boundaries */}
      <div className="mb-8">
        <TestErrorComponent />
      </div>

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
          <h2 className="text-2xl font-headline font-semibold text-foreground">Kedi Bulunamadı</h2>
          <p className="text-muted-foreground mt-2">
            Daha fazla tüylü dost bulmak için arama filtrelerinizi değiştirmeyi deneyin.
          </p>
        </div>
      )}
    </div>
  );
}
