'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import CatsTable from '@/components/admin/cats-table';
import { useState, useCallback } from 'react';
import CatEditDialog from '@/components/admin/cat-edit-dialog';
import { useCats } from '@/hooks/use-cats';

/**
 * Uses useCats() hook. Hook exposes `refresh`, not `refreshCats`.
 * Previous code destructured a non-existent refreshCats causing TypeError.
 */
export default function ManageCatsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { refresh } = useCats();

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline">Kedileri Yönet</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Yeni Kedi Ekle
        </Button>
      </div>
      <CatsTable onRefreshAction={handleRefresh} />

      {/* Add Dialog */}
      <CatEditDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        cat={null}
        isEditing={false}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
