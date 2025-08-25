import RequestsTable from '@/components/admin/requests-table';

export default function AdoptionRequestsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-6">Sahiplenme Talepleri</h1>
      <RequestsTable />
    </div>
  );
}
