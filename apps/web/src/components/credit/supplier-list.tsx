"use client";

import { useSuppliers } from "@/hooks/use-suppliers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export function SupplierList() {
  const { data: suppliers, isLoading } = useSuppliers();
  const router = useRouter();

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!suppliers?.length) {
    return <div className="text-center py-12 text-muted-foreground">No suppliers found. Add your first supplier.</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>GST Number</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow 
              key={supplier.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/credit/supplier/${supplier.id}`)}
            >
              <TableCell className="font-medium">{supplier.name}</TableCell>
              <TableCell>{supplier.phone || "-"}</TableCell>
              <TableCell className="font-semibold text-red-600">
                ₹{supplier.balance || 0}
              </TableCell>
              <TableCell>{supplier.gstNumber || "-"}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                  supplier.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {supplier.isActive ? "Active" : "Inactive"}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
