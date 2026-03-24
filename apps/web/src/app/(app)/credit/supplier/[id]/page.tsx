export default function SupplierDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Supplier Ledger</h1>
      <p className="text-muted-foreground text-sm">Supplier ID: {params.id}</p>
      <div className="rounded-lg border border-dashed border-border h-96 flex items-center justify-center text-muted-foreground">
        Transaction history coming soon
      </div>
    </div>
  );
}
