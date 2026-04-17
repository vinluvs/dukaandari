"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateCustomerModal } from "@/components/credit/create-customer-modal";
import { CreateSupplierModal } from "@/components/credit/create-supplier-modal";
import { CustomerList } from "@/components/credit/customer-list";
import { SupplierList } from "@/components/credit/supplier-list";

export default function CreditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Credit Management</h1>
        <p className="text-muted-foreground">Manage your customer receivables and supplier payables.</p>
      </div>

      <Tabs defaultValue="customers" className="space-y-4 flex flex-col justify-center p-4 max-w-7xl">
        <TabsList>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Customers</h2>
            <CreateCustomerModal />
          </div>
          <CustomerList />
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Suppliers</h2>
            <CreateSupplierModal />
          </div>
          <SupplierList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
