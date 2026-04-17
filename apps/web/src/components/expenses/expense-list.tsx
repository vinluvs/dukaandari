"use client";

import { useExpenses, useDeleteExpense } from "@/hooks/use-expenses";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";

export function ExpenseList() {
  const { data: expenses, isLoading } = useExpenses();
  const { mutate: deleteExpense } = useDeleteExpense();

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!expenses?.length) {
    return <div className="text-center py-12 text-muted-foreground rounded-md border">No expenses found. Record your first expense.</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="text-muted-foreground whitespace-nowrap">
                {format(new Date(expense.createdAt), "dd MMM yyyy")}
              </TableCell>
              <TableCell className="font-medium">{expense.category}</TableCell>
              <TableCell>{expense.description || "-"}</TableCell>
              <TableCell className="font-semibold">₹{expense.amount}</TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this expense?")) {
                      deleteExpense(expense.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
