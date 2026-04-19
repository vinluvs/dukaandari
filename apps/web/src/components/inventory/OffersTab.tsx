"use client";

import { useState } from "react";
import { useOffers, useCreateOffer, useDeleteOffer, useOfferConfig, useUpdateOfferConfig, useAutoGenerateOffers, AutoOfferConfig } from "@/hooks/use-offers";
import { useProducts, useCategories } from "@/hooks/use-inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Settings2, Sparkles, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";

export function OffersTab() {
  const { data: offers = [], isLoading } = useOffers();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: config } = useOfferConfig();
  
  const createOffer = useCreateOffer();
  const deleteOffer = useDeleteOffer();
  const updateConfig = useUpdateOfferConfig();
  const autoGenerate = useAutoGenerateOffers();

  const [open, setOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  
  const [newOffer, setNewOffer] = useState({
    name: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    productId: "none",
    categoryId: "none",
  });

  const handleCreate = async () => {
    await createOffer.mutateAsync({
      ...newOffer,
      discountValue: parseFloat(newOffer.discountValue),
      productId: newOffer.productId === "none" ? undefined : newOffer.productId,
      categoryId: newOffer.categoryId === "none" ? undefined : newOffer.categoryId,
    });
    setOpen(false);
    setNewOffer({ name: "", discountType: "PERCENTAGE", discountValue: "", productId: "none", categoryId: "none" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Offers & Promotions</h2>
          <p className="text-sm text-muted-foreground">Manage discounts and automated selling incentives.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setConfigOpen(true)}>
            <Settings2 size={16} />
            Auto-Config
          </Button>
          <Button size="sm" className="gap-2" onClick={() => autoGenerate.mutate()}>
            <Sparkles size={16} />
            Generate Auto-Offers
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setOpen(true)}>
            <Plus size={16} />
            New Offer
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Offer Name</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : offers.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">No offers found.</TableCell></TableRow>
            ) : (
              offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.name}</TableCell>
                  <TableCell>
                    {offer.product ? (
                      <Badge variant="outline">Product: {offer.product.name}</Badge>
                    ) : offer.category ? (
                      <Badge variant="outline">Category: {offer.category.name}</Badge>
                    ) : (
                      <Badge variant="outline">Global</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {offer.discountType === "PERCENTAGE" ? `${offer.discountValue}%` : `₹${offer.discountValue}`}
                  </TableCell>
                  <TableCell>
                    <Badge variant={offer.isActive ? "default" : "secondary"}>
                      {offer.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => deleteOffer.mutate(offer.id)}>
                      <Trash2 size={16} className="text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* New Offer Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Offer</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Offer Name</Label>
              <Input value={newOffer.name} onChange={e => setNewOffer({...newOffer, name: e.target.value})} placeholder="Summer Sale" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newOffer.discountType} onValueChange={v => setNewOffer({...newOffer, discountType: v as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input type="number" value={newOffer.discountValue} onChange={e => setNewOffer({...newOffer, discountValue: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Apply to Product (Optional)</Label>
              <Select value={newOffer.productId} onValueChange={v => setNewOffer({...newOffer, productId: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Apply to Category (Optional)</Label>
              <Select value={newOffer.categoryId} onValueChange={v => setNewOffer({...newOffer, categoryId: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleCreate} disabled={createOffer.isPending}>
            {createOffer.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Offer
          </Button>
        </DialogContent>
      </Dialog>

      {/* Auto-Config Dialog */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Automated Offer Configuration</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label>Enable Auto-Generation</Label>
              <Switch 
                checked={config?.enabled ?? false} 
                onCheckedChange={v => updateConfig.mutate({...config!, enabled: v} as any)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Slow-moving lookback (days)</Label>
              <Input 
                type="number" 
                value={config?.lookbackDays ?? 30} 
                onChange={e => updateConfig.mutate({...config!, lookbackDays: parseInt(e.target.value)} as any)} 
              />
              <p className="text-[10px] text-muted-foreground">Items not sold in these many days will be flagged.</p>
            </div>
            <div className="space-y-2">
              <Label>Discount Percentage (%)</Label>
              <Input 
                type="number" 
                value={config?.discountPercentage ?? 10} 
                onChange={e => updateConfig.mutate({...config!, discountPercentage: parseInt(e.target.value)} as any)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Max Items to Flag</Label>
              <Input 
                type="number" 
                value={config?.limit ?? 10} 
                onChange={e => updateConfig.mutate({...config!, limit: parseInt(e.target.value)} as any)} 
              />
            </div>
          </div>
          <Button variant="outline" onClick={() => setConfigOpen(false)} className="w-full">Done</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
