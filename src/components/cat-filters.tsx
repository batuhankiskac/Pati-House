'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';

interface CatFiltersProps {
  filters: {
    search: string;
    breed: string;
    age: string;
    gender: string;
  };
  onFilterChange: (filters: CatFiltersProps['filters']) => void;
}

const breeds = ['Persian', 'Siamese', 'Maine Coon', 'Ragdoll', 'Bengal', 'Scottish Fold', 'British Shorthair'];

export default function CatFilters({ filters, onFilterChange }: CatFiltersProps) {
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
                placeholder="Search by name..."
                value={filters.search}
                onChange={handleInputChange}
                className="pl-10"
              />
          </div>
          <Select value={filters.breed} onValueChange={handleSelectChange('breed')}>
            <SelectTrigger>
              <SelectValue placeholder="All Breeds" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Breeds</SelectItem>
              {breeds.map((breed) => (
                <SelectItem key={breed} value={breed}>{breed}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.age} onValueChange={handleSelectChange('age')}>
            <SelectTrigger>
              <SelectValue placeholder="All Ages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ages</SelectItem>
              <SelectItem value="kitten">Kitten (0-1 yr)</SelectItem>
              <SelectItem value="adult">Adult (1-8 yrs)</SelectItem>
              <SelectItem value="senior">Senior (8+ yrs)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.gender} onValueChange={handleSelectChange('gender')}>
            <SelectTrigger>
              <SelectValue placeholder="All Genders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
