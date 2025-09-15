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
import { AdminErrorBoundary } from '@/components/admin/error-boundary';
import { catFormSchema, catUpdateSchema } from '@/lib/validation/cats';
import { validateData } from '@/lib/validation/utils';
import type { CatFormData } from '@/lib/validation/cats';

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

    // Validate form data
    const validationSchema = isEditing ? catUpdateSchema : catFormSchema;
    const validationResult = validateData(validationSchema, formData);

    if (!validationResult.success) {
      // Display validation errors
      toast({
        title: 'Validation Error',
        description: 'Please check the form for errors.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const result = isEditing && cat
        ? await updateCat(cat.id, formData)
        : await createCat(formData);

      if (result.success) {
        toast({
          title: 'Success',
          description: isEditing ? 'Cat successfully updated.' : 'Cat successfully added.',
        });
        onOpenChange(false);
        onSuccess && onSuccess();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Operation failed',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
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
          aria-label={isEditing ? 'Edit Cat' : 'Add New Cat'}
          role="dialog"
          aria-modal="true"
        >
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Cat' : 'Add New Cat'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update cat information.' : 'Enter new cat information.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="name"
                className="text-right"
                aria-required="true"
              >
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                required
                aria-describedby="name-error"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="breed"
                className="text-right"
                aria-required="true"
              >
                Breed
              </Label>
              <Input
                id="breed"
                value={formData.breed}
                onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                className="col-span-3"
                required
                aria-describedby="breed-error"
              />
            </div>
              <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="age"
                className="text-right"
                aria-required="true"
              >
                Age
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
                aria-describedby="age-error"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="gender"
                className="text-right"
                aria-required="true"
              >
                Gender
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value: 'Male' | 'Female') => setFormData(prev => ({ ...prev, gender: value }))}
                aria-describedby="gender-error"
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label
                htmlFor="description"
                className="text-right mt-2"
                aria-required="true"
              >
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
                rows={3}
                required
                aria-describedby="description-error"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="image"
                className="text-right"
                aria-required="true"
              >
                Image URL
              </Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                className="col-span-3"
                required
                aria-describedby="image-error"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                aria-label="Cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="sr-only">Saving</span>
                    Saving...
                  </>
                ) : (
                  isEditing ? 'Update' : 'Add'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminErrorBoundary>
  );
}
