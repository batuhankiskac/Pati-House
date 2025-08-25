import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import CatsTable from '@/components/admin/cats-table';

export default function ManageCatsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline">Manage Cats</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Cat
        </Button>
      </div>
      <CatsTable />
    </div>
  );
}
