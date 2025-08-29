'use client';

import React, { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { useCats } from '@/hooks/use-cats';

interface CatFiltersProps {
  filters: {
    search: string;
    breed: string;
    age: string;
    gender: string;
  };
  onFilterChange: (filters: CatFiltersProps['filters']) => void;
}

/**
 * Dynamic breed derivation replaces former hard-coded list.
 * Ensures newly added breeds (örn. "sarman") appear automatically.
 */
export default function CatFilters({ filters, onFilterChange }: CatFiltersProps) {
  const { cats } = useCats();

  const breeds = useMemo(() => {
    const set = new Set<string>();
    for (const c of cats) {
      const b = (c.breed || '').trim();
      if (b) set.add(b);
    }
    const arr = Array.from(set);
    arr.sort((a, b) => a.localeCompare(b, 'tr'));
    console.debug('[filters] derived breeds', arr);
    return arr;
  }, [cats]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleSelectChange = (name: keyof CatFiltersProps['filters']) => (value: string) => {
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <Card className="mb-8 shadow-sm">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="İsme göre ara..."
              value={filters.search}
              onChange={handleInputChange}
              className="pl-10"
            />
          </div>
          <Select value={filters.breed} onValueChange={handleSelectChange('breed')}>
            <SelectTrigger>
              <SelectValue placeholder="Tüm Cinsler" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Cinsler</SelectItem>
              {breeds.map((breed) => (
                <SelectItem key={breed} value={breed}>{breed}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.age} onValueChange={handleSelectChange('age')}>
            <SelectTrigger>
              <SelectValue placeholder="Tüm Yaşlar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Yaşlar</SelectItem>
              <SelectItem value="yavru">Yavru (0-1 yaş)</SelectItem>
              <SelectItem value="yetişkin">Yetişkin (1-8 yaş)</SelectItem>
              <SelectItem value="yaşlı">Yaşlı (8+ yaş)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.gender} onValueChange={handleSelectChange('gender')}>
            <SelectTrigger>
              <SelectValue placeholder="Tüm Cinsiyetler" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Cinsiyetler</SelectItem>
              <SelectItem value="Male">Erkek</SelectItem>
              <SelectItem value="Female">Dişi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
