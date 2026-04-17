"use client";

import { useParams, useRouter } from "next/navigation";
import { useSuppliers, useSupplierLedger } from "@/hooks/use-suppliers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Mail, Receipt } from "lucide-react";
import { format } from "date-fns";

export default function SupplierDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const { data: suppliers, isLoading: isSuppliersLoading } = useSuppliers();
  const { data: ledger, isLoading: isLedgerLoading } = useSupplierLedger(id);
  
  const supplier = suppliers?.find((s) => s.id === id);

  if (isSuppliersLoading) return <Skeleton className="h-64 w-full" />;

  if (!supplier) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <div className="text-center py-12 text-muted-foreground">Supplier not found.</div>
      </div>
    );
  }

  const balance = ledger?.balance || 0;
  const entries = ledger?.entries || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{supplier.name}</h1>
          <p className="text-sm text-muted-foreground">Supplier details and financial ledger</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div className="flex items-center"><Phone className="mr-2 h-4 w-4 text-muted-foreground" /> {supplier.phone || 'N/A'}</div>
              <div className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" /> {supplier.email || 'N/A'}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GST Number</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{supplier.gstNumber || 'Unregistered'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ₹{Math.abs(balance).toFixed(2)} {balance > 0 ? '(Payable)' : '(Advance)'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Ledger & Transactions</h2>
        {isLedgerLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : !entries?.length ? (
          <div className="rounded-md border p-8 text-center text-muted-foreground">
            No transactions found for this supplier.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry: any) => (
                  <TableRow key={entry.id}>
                    <TableCell>{format(new Date(entry.createdAt), "dd MMM yyyy, HH:mm")}</TableCell>
                    <TableCell className="font-medium uppercase">{entry.referenceType} #{entry.referenceId.slice(-6)}</TableCell>
                    <TableCell>{entry.description || "-"}</TableCell>
                    <TableCell className="text-right text-red-600">{Number(entry.debit) > 0 ? `₹${entry.debit}` : "-"}</TableCell>
                    <TableCell className="text-right text-green-600">{Number(entry.credit) > 0 ? `₹${entry.credit}` : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
