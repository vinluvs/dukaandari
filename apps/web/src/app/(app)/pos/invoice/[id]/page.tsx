export default function InvoicePage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Invoice #{params.id}</h1>
      <div className="rounded-lg border border-dashed border-border h-96 flex items-center justify-center text-muted-foreground">
        Invoice view coming soon
      </div>
    </div>
  );
}
