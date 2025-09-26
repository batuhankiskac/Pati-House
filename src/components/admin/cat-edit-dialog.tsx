'use client';

import React, { useEffect, useState } from 'react';
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
import { restoreBodyPointerEvents } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { AdminErrorBoundary } from '@/components/admin/error-boundary';
import { catFormSchema, catUpdateSchema } from '@/lib/validation/cats';
import { formatErrors, validateData } from '@/lib/validation/utils';
import type { CatFormData, CatUpdateData } from '@/lib/validation/cats';

interface CatEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cat?: Cat | null;
  isEditing?: boolean;
  onSuccess?: () => void | Promise<void>;
  onCreateCat: (data: CatFormData) => Promise<{ success: boolean; cat?: Cat; error?: string }>;
  onUpdateCat: (id: number, data: CatUpdateData) => Promise<{ success: boolean; cat?: Cat; error?: string }>;
}

export default function CatEditDialog({
  isOpen,
  onOpenChange,
  cat,
  isEditing = false,
  onSuccess,
  onCreateCat,
  onUpdateCat
}: CatEditDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<CatFormData>({
    name: cat?.name || '',
    breed: cat?.breed || '',
    age: cat?.age || 1,
    gender: (cat?.gender || 'Male') as 'Male' | 'Female',
    description: cat?.description || '',
    image: cat?.image || 'https://placehold.co/600x600.png'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      name: cat?.name || '',
      breed: cat?.breed || '',
      age: cat?.age || 1,
      gender: (cat?.gender || 'Male') as 'Male' | 'Female',
      description: cat?.description || '',
      image: cat?.image || 'https://placehold.co/600x600.png'
    });
    setFieldErrors({});
  }, [cat, isOpen, isEditing]);

  useEffect(() => {
    if (!isOpen) {
      restoreBodyPointerEvents();
    }

    return () => {
      restoreBodyPointerEvents();
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (isEditing && !cat) {
      toast({
        title: 'Hata',
        description: 'Düzenlenecek kedi bulunamadı.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    // Validate form data
    const validationSchema = isEditing ? catUpdateSchema : catFormSchema;
    const validationResult = validateData(validationSchema, formData);

    if (!validationResult.success) {
      setFieldErrors(formatErrors(validationResult.errors || []));
      toast({
        title: 'Doğrulama Hatası',
        description: 'Lütfen form alanlarını kontrol edin.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const result = isEditing && cat
        ? await onUpdateCat(cat.id, formData)
        : await onCreateCat(formData);

      if (result.success) {
        setFieldErrors({});
        toast({
          title: 'Başarılı',
          description: isEditing ? 'Kedi bilgileri güncellendi.' : 'Kedi başarıyla eklendi.',
        });
        onOpenChange(false);
        await onSuccess?.();
      } else {
        toast({
          title: 'Hata',
          description: result.error || 'İşlem başarısız oldu.',
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
    <AdminErrorBoundary>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-[425px]"
          aria-label={isEditing ? 'Kedi Bilgilerini Düzenle' : 'Yeni Kedi Ekle'}
          role="dialog"
          aria-modal="true"
        >
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Kedi Bilgilerini Düzenle' : 'Yeni Kedi Ekle'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Kedi bilgilerini güncelleyin.' : 'Yeni kedi bilgilerini girin.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="name"
                className="text-right"
                aria-required="true"
              >
                İsim
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                required
                aria-describedby="name-error"
                aria-invalid={Boolean(fieldErrors.name)}
              />
              {fieldErrors.name && (
                <p className="col-start-2 col-span-3 text-sm text-red-600" id="name-error">
                  {fieldErrors.name}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="breed"
                className="text-right"
                aria-required="true"
              >
                Cins
              </Label>
              <Input
                id="breed"
                value={formData.breed}
                onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                className="col-span-3"
                required
                aria-describedby="breed-error"
                aria-invalid={Boolean(fieldErrors.breed)}
              />
              {fieldErrors.breed && (
                <p className="col-start-2 col-span-3 text-sm text-red-600" id="breed-error">
                  {fieldErrors.breed}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="age"
                className="text-right"
                aria-required="true"
              >
                Yaş
              </Label>
              <Input
                id="age"
                type="number"
                min="0"
                max="20"
                value={formData.age}
                onChange={(e) => {
                  const nextValue = Number(e.target.value);
                  setFormData(prev => ({ ...prev, age: Number.isNaN(nextValue) ? 0 : nextValue }));
                }}
                className="col-span-3"
                required
                aria-describedby="age-error"
                aria-invalid={Boolean(fieldErrors.age)}
              />
              {fieldErrors.age && (
                <p className="col-start-2 col-span-3 text-sm text-red-600" id="age-error">
                  {fieldErrors.age}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="gender"
                className="text-right"
                aria-required="true"
              >
                Cinsiyet
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value: 'Male' | 'Female') => setFormData(prev => ({ ...prev, gender: value }))}
                aria-describedby="gender-error"
                aria-invalid={Boolean(fieldErrors.gender)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Erkek</SelectItem>
                  <SelectItem value="Female">Dişi</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.gender && (
                <p className="col-start-2 col-span-3 text-sm text-red-600" id="gender-error">
                  {fieldErrors.gender}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label
                htmlFor="description"
                className="text-right mt-2"
                aria-required="true"
              >
                Açıklama
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
                rows={3}
                required
                aria-describedby="description-error"
                aria-invalid={Boolean(fieldErrors.description)}
              />
              {fieldErrors.description && (
                <p className="col-start-2 col-span-3 text-sm text-red-600" id="description-error">
                  {fieldErrors.description}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="image"
                className="text-right"
                aria-required="true"
              >
                Görsel URL'si
              </Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                className="col-span-3"
                required
                aria-describedby="image-error"
                aria-invalid={Boolean(fieldErrors.image)}
              />
              {fieldErrors.image && (
                <p className="col-start-2 col-span-3 text-sm text-red-600" id="image-error">
                  {fieldErrors.image}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                aria-label="İptal"
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="sr-only">Kaydediliyor</span>
                    Kaydediliyor...
                  </>
                ) : (
                  isEditing ? 'Güncelle' : 'Ekle'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminErrorBoundary>
  );
}
