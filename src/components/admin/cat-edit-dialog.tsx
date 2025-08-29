'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cat } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useCats } from '@/hooks/use-cats';

interface CatEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cat?: Cat | null;
  isEditing?: boolean;
  onSuccess?: () => void;
}

export default function CatEditDialog({ isOpen, onOpenChange, cat, isEditing = false, onSuccess }: CatEditDialogProps) {
  const { toast } = useToast();
  const { createCat, updateCat } = useCats();
  const [formData, setFormData] = useState({
    name: cat?.name || '',
    breed: cat?.breed || '',
    age: cat?.age || 1,
    gender: (cat?.gender || 'Male') as 'Male' | 'Female',
    description: cat?.description || '',
    image: cat?.image || 'https://placehold.co/600x600.png'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = isEditing && cat
        ? await updateCat(cat.id, formData)
        : await createCat(formData);

      if (result.success) {
        toast({
          title: 'Başarılı',
          description: isEditing ? 'Kedi başarıyla güncellendi.' : 'Kedi başarıyla eklendi.',
        });
        onOpenChange(false);
        onSuccess && onSuccess();
      } else {
        toast({
          title: 'Hata',
          description: result.error || 'İşlem başarısız',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Beklenmeyen bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Kedi Düzenle' : 'Yeni Kedi Ekle'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Kedi bilgilerini güncelleyin.' : 'Yeni kedi bilgilerini girin.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              İsim
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="breed" className="text-right">
              Cins
            </Label>
            <Input
              id="breed"
              value={formData.breed}
              onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
              className="col-span-3"
              required
            />
          </div>
            <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="age" className="text-right">
              Yaş
            </Label>
            <Input
              id="age"
              type="number"
              min="0"
              max="20"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 1 }))}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="gender" className="text-right">
              Cinsiyet
            </Label>
            <Select value={formData.gender} onValueChange={(value: 'Male' | 'Female') => setFormData(prev => ({ ...prev, gender: value }))}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Erkek</SelectItem>
                <SelectItem value="Female">Dişi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right mt-2">
              Açıklama
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="col-span-3"
              rows={3}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              Resim URL
            </Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              className="col-span-3"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Kaydediliyor...' : (isEditing ? 'Güncelle' : 'Ekle')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
