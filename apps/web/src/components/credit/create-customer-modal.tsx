import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateCustomerSchema, CreateCustomerInput } from "@dukaandari/shared";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCustomer } from "@/hooks/use-customers";
import { UserPlus } from "lucide-react";

interface CreateCustomerModalProps {
  onSuccess?: () => void;
  triggerContext?: React.ReactNode;
}

export function CreateCustomerModal({ onSuccess, triggerContext }: CreateCustomerModalProps) {
  const [open, setOpen] = useState(false);
  const { mutate: createCustomer, isPending } = useCreateCustomer();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCustomerInput>({
    resolver: zodResolver(CreateCustomerSchema),
    defaultValues: { creditLimit: 0 },
  });

  const onSubmit = (data: CreateCustomerInput) => {
    createCustomer(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
        onSuccess?.();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerContext || (
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" /> Add Customer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
            <Input id="name" placeholder="John Doe" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" placeholder="+1234567890" {...register("phone")} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="creditLimit">Credit Limit</Label>
            <Input id="creditLimit" type="number" step="0.01" {...register("creditLimit")} />
            {errors.creditLimit && <p className="text-sm text-destructive">{errors.creditLimit.message}</p>}
          </div>
          <div className="flex justify-end pt-4">
            <Button type="button" variant="outline" className="mr-2" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
