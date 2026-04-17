import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateExpenseSchema, CreateExpenseInput } from "@dukaandari/shared";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateExpense } from "@/hooks/use-expenses";
import { PlusCircle } from "lucide-react";

export function CreateExpenseModal() {
  const [open, setOpen] = useState(false);
  const { mutate: createExpense, isPending } = useCreateExpense();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateExpenseInput>({
    resolver: zodResolver(CreateExpenseSchema),
    defaultValues: { amount: 0, category: "", description: "" },
  });

  const onSubmit = (data: CreateExpenseInput) => {
    createExpense(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined} className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
            <Input id="category" placeholder="eg. Electricity, Office Supplies" {...register("category")} />
            {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount <span className="text-destructive">*</span></Label>
            <Input id="amount" type="number" step="0.01" {...register("amount")} />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" placeholder="Paid to..." {...register("description")} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>
          <div className="flex justify-end pt-4">
            <Button type="button" variant="outline" className="mr-2" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Record Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
