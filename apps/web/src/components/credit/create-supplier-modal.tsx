import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateSupplierSchema, CreateSupplierInput } from "@dukaandari/shared";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateSupplier } from "@/hooks/use-suppliers";
import { Truck } from "lucide-react";

interface CreateSupplierModalProps {
  onSuccess?: () => void;
  triggerContext?: React.ReactNode;
}

export function CreateSupplierModal({ onSuccess, triggerContext }: CreateSupplierModalProps) {
  const [open, setOpen] = useState(false);
  const { mutate: createSupplier, isPending } = useCreateSupplier();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSupplierInput>({
    resolver: zodResolver(CreateSupplierSchema),
  });

  const onSubmit = (data: CreateSupplierInput) => {
    createSupplier(data, {
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
            <Truck className="mr-2 h-4 w-4" /> Add Supplier
          </Button>
        )}
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
            <Input id="name" placeholder="Acme Corp" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" placeholder="+1234567890" {...register("phone")} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="supplier@example.com" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="gstNumber">GST Number</Label>
            <Input id="gstNumber" placeholder="22AAAAA0000A1Z5" {...register("gstNumber")} />
            {errors.gstNumber && <p className="text-sm text-destructive">{errors.gstNumber.message}</p>}
          </div>
          <div className="flex justify-end pt-4">
            <Button type="button" variant="outline" className="mr-2" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Supplier"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
