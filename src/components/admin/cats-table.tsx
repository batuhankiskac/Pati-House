'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Cat } from '@/lib/data';
import { Button } from '../ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';
import CatEditDialog from './cat-edit-dialog';
import { useCats } from '@/hooks/use-cats';
import { AdminErrorBoundary } from '@/components/admin/error-boundary';

export default function CatsTable({ onRefreshAction }: { onRefreshAction?: () => void }) {
  const { toast } = useToast();
  const { cats, loading, error, refresh, deleteCat } = useCats();
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Manual refresh handler (if external parent wants)
  const triggerExternalRefresh = () => {
    refresh();
    onRefreshAction && onRefreshAction();
  };

  const handleDelete = async (catId: number, catName: string) => {
    if (!window.confirm(`${catName} adlı kediyi silmek istediğinize emin misiniz?`)) return;
    const result = await deleteCat(catId);
    if (result.success) {
      toast({
        title: 'Başarılı',
        description: 'Kedi silindi (geçici sonuç).',
      });
      triggerExternalRefresh();
    } else {
      toast({
        title: 'Hata',
        description: result.error || 'Kedi silinirken bir hata oluştu.',
        variant: 'destructive',
      });
      // Attempt to resync from server
      refresh();
    }
  };

  const handleEdit = (cat: Cat) => {
    setSelectedCat(cat);
    setIsEditDialogOpen(true);
  };

  return (
    <AdminErrorBoundary>
      <Card
        role="region"
        aria-label="Kedi tablosu"
      >
        <CardHeader>
          <CardTitle>Kediler</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div
              className="py-4 text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              Yükleniyor...
            </div>
          )}
          {error && !loading && (
            <div
              className="py-2 text-sm text-red-600"
              role="alert"
              aria-live="assertive"
            >
              Hata: {error}
            </div>
          )}
          {!loading && !error && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Görsel</span>
                </TableHead>
                <TableHead scope="col">İsim</TableHead>
                <TableHead scope="col">Cins</TableHead>
                <TableHead scope="col" className="hidden md:table-cell">Yaş</TableHead>
                <TableHead scope="col" className="hidden md:table-cell">Cinsiyet</TableHead>
                <TableHead scope="col">
                  <span className="sr-only">İşlemler</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cats.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={`${cat.name} kedisinin fotoğrafı`}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={cat.image}
                      width="64"
                      sizes="64px"
                      data-ai-hint={cat.dataAiHint}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{cat.breed}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{cat.age} yaş</TableCell>
                  <TableCell className="hidden md:table-cell">{cat.gender === 'Male' ? 'Erkek' : 'Dişi'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                          className="h-10 w-10"
                          aria-label={`${cat.name} için işlemler`}
                        >
                          <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                          <span className="sr-only">Menüyü aç</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(cat)}>
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="text-red-600"
                        >
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <CatEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        cat={selectedCat}
        isEditing={true}
        onSuccess={() => {
          refresh();
          triggerExternalRefresh();
        }}
      />
    </AdminErrorBoundary>
 );
}
