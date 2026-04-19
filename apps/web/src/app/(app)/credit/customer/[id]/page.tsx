"use client";

import { useParams, useRouter } from "next/navigation";
import { useCustomers, useCustomerLedger } from "@/hooks/use-customers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Mail, Wallet } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRecordRepayment } from "@/hooks/use-customers";

export default function CustomerDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const { data: customers, isLoading: isCustomersLoading } = useCustomers();
  const { data: ledger, isLoading: isLedgerLoading } = useCustomerLedger(id);
  const { mutate: recordRepayment, isPending: isRepaying } = useRecordRepayment(id);
  
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("cash");
  const [notes, setNotes] = useState("");
  
  const customer = customers?.find((c) => c.id === id);

  if (isCustomersLoading) return <Skeleton className="h-64 w-full" />;

  if (!customer) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <div className="text-center py-12 text-muted-foreground">Customer not found.</div>
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
          <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
          <p className="text-sm text-muted-foreground">Customer details and financial ledger</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div className="flex items-center"><Phone className="mr-2 h-4 w-4 text-muted-foreground" /> {customer.phone || 'N/A'}</div>
              <div className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" /> {customer.email || 'N/A'}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Limit</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{customer.creditLimit}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            {balance > 0 && (
              <Button size="sm" variant="outline" onClick={() => {
                setAmount(balance.toString());
                setOpen(true);
              }}>
                Repay
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ₹{Math.abs(balance).toFixed(2)} {balance > 0 ? '(Due)' : '(Advance)'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record Repayment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mode">Payment Mode</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger id="mode">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => {
                const val = parseFloat(amount);
                if (isNaN(val) || val <= 0) return;
                recordRepayment({ amount: val, mode, notes }, {
                  onSuccess: () => {
                    setOpen(false);
                    setAmount("");
                    setNotes("");
                  }
                });
              }}
              disabled={isRepaying}
            >
              {isRepaying ? "Saving..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Ledger & Transactions</h2>
        {isLedgerLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : !entries?.length ? (
          <div className="rounded-md border p-8 text-center text-muted-foreground">
            No transactions found for this customer.
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
