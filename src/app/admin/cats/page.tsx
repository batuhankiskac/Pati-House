'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import CatsTable from '@/components/admin/cats-table';
import { useState, useCallback } from 'react';
import CatEditDialog from '@/components/admin/cat-edit-dialog';
import { useCats } from '@/hooks/use-cats';
import type { Cat } from '@/lib/data';

/**
 * Manage cats page keeps a single source of truth for cat data mutations
 * via the useCats() hook and shares it with the table and dialog.
 */
export default function ManageCatsPage() {
  const {
    cats,
    loading,
    error,
    refresh,
    createCat,
    updateCat,
    deleteCat
  } = useCats();

  const [dialogState, setDialogState] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    cat: Cat | null;
  }>({
    open: false,
    mode: 'create',
    cat: null,
  });

  const openCreateDialog = useCallback(() => {
    setDialogState({ open: true, mode: 'create', cat: null });
  }, []);

  const openEditDialog = useCallback((catToEdit: Cat) => {
    setDialogState({ open: true, mode: 'edit', cat: catToEdit });
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogState(prev => (open ? { ...prev, open: true } : {
      open: false,
      mode: 'create',
      cat: null,
    }));
  }, []);

  const handleRefresh = useCallback(() => refresh(), [refresh]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline">Kedileri Yönet</h1>
        <Button onClick={openCreateDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Yeni Kedi Ekle
        </Button>
      </div>
      <CatsTable
        cats={cats}
        loading={loading}
        error={error}
        onRefreshAction={handleRefresh}
        onEditCat={openEditDialog}
        onDeleteCat={deleteCat}
      />

      {/* Add Dialog */}
      <CatEditDialog
        isOpen={dialogState.open}
        onOpenChange={handleDialogOpenChange}
        cat={dialogState.cat}
        isEditing={dialogState.mode === 'edit'}
        onSuccess={handleRefresh}
        onCreateCat={createCat}
        onUpdateCat={updateCat}
      />
    </div>
  );
}
