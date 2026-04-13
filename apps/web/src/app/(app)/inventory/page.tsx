"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductsTab } from "@/components/inventory/ProductsTab";
import { CategoriesTab } from "@/components/inventory/CategoriesTab";
import { UomTab } from "@/components/inventory/UomTab";

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Inventory Control</h1>
        <p className="text-sm text-muted-foreground">Manage your products, categories, and units of measure.</p>
      </div>


      <div className="mt-6 border border-border bg-card rounded-xl p-6 min-h-[500px]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 max-w-md h-12">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="uoms">UOMs</TabsTrigger>
          </TabsList>
          <div className="mt-6">
            <TabsContent value="products" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <ProductsTab />
            </TabsContent>

            <TabsContent value="categories" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <CategoriesTab />
            </TabsContent>

            <TabsContent value="uoms" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <UomTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
