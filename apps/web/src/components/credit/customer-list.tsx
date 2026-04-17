"use client";

import { useCustomers } from "@/hooks/use-customers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export function CustomerList() {
  const { data: customers, isLoading } = useCustomers();
  const router = useRouter();

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!customers?.length) {
    return <div className="text-center py-12 text-muted-foreground">No customers found. Add your first customer.</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Credit Limit</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow 
              key={customer.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/credit/customer/${customer.id}`)}
            >
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell>{customer.phone || "-"}</TableCell>
              <TableCell className="font-semibold text-red-600">
                ₹{customer.balance || 0}
              </TableCell>
              <TableCell>₹{customer.creditLimit}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                  customer.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {customer.isActive ? "Active" : "Inactive"}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
