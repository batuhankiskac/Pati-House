'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint, Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCats } from '@/hooks/use-cats';
import { useRequests } from '@/hooks/use-requests';

export default function AdminDashboard() {
  const { cats } = useCats();
  const { requests: adoptionRequests } = useRequests();

  const totalCats = cats.length;
  const pendingRequests = adoptionRequests.filter(req => req.status === 'Pending').length;

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-6">Admin Paneli</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kedi Sayısı</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCats}</div>
            <p className="text-xs text-muted-foreground"> sahiplenilmeyi bekleyen sevimli kedi</p>
             <Button asChild size="sm" className="mt-4">
                <Link href="/admin/cats">Kedileri Yönet</Link>
              </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Sahiplenme Talepleri</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground"> incelenmeyi bekleyen başvuru</p>
             <Button asChild size="sm" className="mt-4">
                <Link href="/admin/requests">Talepleri Görüntüle</Link>
              </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
