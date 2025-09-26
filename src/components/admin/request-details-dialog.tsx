'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { AdoptionRequest } from '@/lib/data';
import { User, Mail, Phone, Home, FileText } from 'lucide-react';
import { useRequests } from '@/hooks/use-requests';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { restoreBodyPointerEvents } from '@/lib/utils';

interface RequestDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  request: AdoptionRequest;
}

export default function RequestDetailsDialog({
  isOpen,
  onOpenChange,
  request,
}: RequestDetailsDialogProps) {
  const { applicant, catName, id, status } = request;
  const { updateStatus } = useRequests();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState<'Approved' | 'Rejected' | null>(null);

  useEffect(() => {
    if (!isOpen) {
      restoreBodyPointerEvents();
    }

    return () => {
      restoreBodyPointerEvents();
    };
  }, [isOpen]);

  const changeStatus = async (next: 'Approved' | 'Rejected') => {
    if (status === next) {
      onOpenChange(false);
      return;
    }
    setSubmitting(next);
    const res = await updateStatus(id, next);
    if (res.success) {
      toast({
        title: 'Durum güncellendi',
        description: `Başvuru ${next.toLowerCase()}.`,
      });
      onOpenChange(false);
    } else {
      toast({
        title: 'Hata',
        description: res.error || 'Durum güncellenemedi',
        variant: 'destructive',
      });
    }
    setSubmitting(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Sahiplenme Başvuru Detayları</DialogTitle>
          <DialogDescription>
            {applicant.name} kullanıcısının {catName} için yaptığı başvuru.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1 flex items-center text-muted-foreground">
              <User className="mr-2 h-4 w-4" />
              <span className="font-semibold">Başvuran</span>
            </div>
            <div className="col-span-3">{applicant.name}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1 flex items-center text-muted-foreground">
              <Mail className="mr-2 h-4 w-4" />
              <span className="font-semibold">E-posta</span>
            </div>
            <div className="col-span-3">{applicant.email}</div>
          </div>
            <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1 flex items-center text-muted-foreground">
              <Phone className="mr-2 h-4 w-4" />
              <span className="font-semibold">Telefon</span>
            </div>
            <div className="col-span-3">{applicant.phone}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1 flex items-center text-muted-foreground">
              <Home className="mr-2 h-4 w-4" />
              <span className="font-semibold">Adres</span>
            </div>
            <div className="col-span-3">{applicant.address}</div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <div className="col-span-1 flex items-center text-muted-foreground pt-1">
              <FileText className="mr-2 h-4 w-4" />
              <span className="font-semibold">Neden</span>
            </div>
            <div className="col-span-3 bg-muted/50 p-3 rounded-md border text-sm">
              {applicant.reason}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Kapat</Button>
          <Button
            variant="outline"
            disabled={submitting !== null}
            onClick={() => changeStatus('Rejected')}
          >
            {submitting === 'Rejected' ? 'İşleniyor...' : 'Reddet'}
          </Button>
          <Button
            disabled={submitting !== null}
            onClick={() => changeStatus('Approved')}
          >
            {submitting === 'Approved' ? 'İşleniyor...' : 'Onayla'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
