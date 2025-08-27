'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { type AdoptionRequest } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '../ui/button';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import RequestDetailsDialog from './request-details-dialog';
import { updateRequestStatus } from '@/actions/admin';
import { useToast } from '@/hooks/use-toast';
import { useRequests } from '@/hooks/use-requests';

export default function RequestsTable() {
  const [selectedRequest, setSelectedRequest] = useState<AdoptionRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { requests: adoptionRequests, refreshRequests, refreshKey } = useRequests();

  const handleViewRequest = (request: AdoptionRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const handleStatusChange = async (requestId: number, status: 'Onaylandı' | 'Reddedildi') => {
    try {
      const result = await updateRequestStatus(requestId, status);
      if (result.success) {
        toast({
          title: 'Başarılı',
          description: `Başvuru ${status.toLowerCase()}.`,
        });
        // Sayfayı yenile
        refreshRequests();
      } else {
        toast({
          title: 'Hata',
          description: result.error || 'Durum güncellenirken hata oluştu.',
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
  };

  return (
    <>
      <Card>
        <CardContent>
          <Table key={refreshKey}>
            <TableHeader>
              <TableRow>
                <TableHead>Kedi Adı</TableHead>
                <TableHead>Başvuran</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="hidden md:table-cell">Talep Tarihi</TableHead>
                <TableHead>
                  <span className="sr-only">Eylemler</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adoptionRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.catName}</TableCell>
                   <TableCell>{request.applicant.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn({
                        'bg-green-100 text-green-800 border-green-300': request.status === 'Onaylandı',
                        'bg-yellow-100 text-yellow-800 border-yellow-300': request.status === 'Bekliyor',
                        'bg-red-100 text-red-800 border-red-300': request.status === 'Reddedildi',
                      })}
                    >
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{request.requestDate}</TableCell>
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
                        {request.status !== 'Onaylandı' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(request.id, 'Onaylandı')}>
                            Onayla
                          </DropdownMenuItem>
                        )}
                        {request.status !== 'Reddedildi' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(request.id, 'Reddedildi')}>
                            Reddet
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleViewRequest(request)}>
                          Başvuruyu Görüntüle
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
      {selectedRequest && (
         <RequestDetailsDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            request={selectedRequest}
         />
      )}
    </>
  );
}
