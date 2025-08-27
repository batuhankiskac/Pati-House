'use client';

import RequestsTable from '@/components/admin/requests-table';
import { useRequests } from '@/hooks/use-requests';

export default function AdoptionRequestsPage() {
  const { refreshRequests } = useRequests();

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-6">Sahiplenme Talepleri</h1>
      <RequestsTable />
    </div>
  );
}
