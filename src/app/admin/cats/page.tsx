'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import CatsTable from '@/components/admin/cats-table';
import { useState } from 'react';
import CatEditDialog from '@/components/admin/cat-edit-dialog';

export default function ManageCatsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline">Kedileri Yönet</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Yeni Kedi Ekle
        </Button>
      </div>
      <CatsTable key={refreshKey} onRefreshAction={handleRefresh} />

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
