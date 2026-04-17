"use client";

import { CreateExpenseModal } from "@/components/expenses/create-expense-modal";
import { ExpenseList } from "@/components/expenses/expense-list";

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Manage ongoing and one-time business expenses.</p>
        </div>
        <CreateExpenseModal />
      </div>

      <ExpenseList />
    </div>
  );
}
