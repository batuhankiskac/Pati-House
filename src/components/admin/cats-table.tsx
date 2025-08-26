'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cats, type Cat } from '@/lib/data';
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
import { deleteCat } from '@/actions/admin';
import { useToast } from '@/hooks/use-toast';
import CatEditDialog from './cat-edit-dialog';

export default function CatsTable({ onRefreshAction }: { onRefreshAction?: () => void }) {
  const { toast } = useToast();
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Force refresh function
  const forceRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleDelete = async (catId: number, catName: string) => {
    if (window.confirm(`${catName} isimli kediyi silmek istediğinize emin misiniz?`)) {
      try {
        const result = await deleteCat(catId);
        if (result.success) {
          toast({
            title: 'Başarılı',
            description: 'Kedi başarıyla silindi.',
          });
          // Sayfayı yenile
          if (onRefreshAction) onRefreshAction();
        } else {
          toast({
            title: 'Hata',
            description: result.error || 'Kedi silinirken hata oluştu.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Hata',
          description: 'Beklenmeyen bir hata oluştu.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleEdit = (cat: Cat) => {
    setSelectedCat(cat);
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Kediler</CardTitle>
        </CardHeader>
        <CardContent>
          <Table key={refreshKey}>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">Resim</TableHead>
                <TableHead>İsim</TableHead>
                <TableHead>Cins</TableHead>
                <TableHead className="hidden md:table-cell">Yaş</TableHead>
                <TableHead className="hidden md:table-cell">Cinsiyet</TableHead>
                <TableHead>
                  <span className="sr-only">Eylemler</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cats.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt="Kedi resmi"
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={cat.image}
                      width="64"
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
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Menüyü aç</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Eylemler</DropdownMenuLabel>
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
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <CatEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        cat={selectedCat}
        isEditing={true}
        onSuccess={() => {
          if (onRefreshAction) onRefreshAction();
          forceRefresh();
        }}
      />
    </>
  );
}
