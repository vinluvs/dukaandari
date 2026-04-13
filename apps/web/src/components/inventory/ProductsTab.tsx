"use client";

import { useState, useMemo } from "react";
import { useProducts, useCategories, useUoms, useCreateProduct, useUpdateProduct, useDeleteProduct, Product } from "@/hooks/use-inventory";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Edit2, Trash2, Search, Camera } from "lucide-react";
import { BarcodeScanner } from "./BarcodeScanner";

const INITIAL_FORM_DATA = {
  name: "", sku: "", barcode: "", valuationMethod: "WEIGHTED_AVERAGE", openingStock: "0", categoryId: "none", uomId: "none", sellingPrice: "", purchasePrice: "", gstPercentage: "0", hsnCode: "", lowStockThreshold: "0"
};

export function ProductsTab() {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: uoms } = useUoms();
  
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [scanOpen, setScanOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const openAdd = () => {
    setEditingProd(null);
    setFormData(INITIAL_FORM_DATA);
    setFormOpen(true);
  };

  const openEdit = (prod: Product) => {
    setEditingProd(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      barcode: prod.barcode || "",
      valuationMethod: prod.valuationMethod || "WEIGHTED_AVERAGE",
      openingStock: "0",
      categoryId: prod.categoryId || "none",
      uomId: prod.uomId || "none",
      sellingPrice: prod.sellingPrice.toString(),
      purchasePrice: prod.purchasePrice.toString(),
      gstPercentage: prod.gstPercentage?.toString() || "0",
      hsnCode: prod.hsnCode || "",
      lowStockThreshold: prod.lowStockThreshold.toString(),
    });
    setFormOpen(true);
  };

  const openDelete = (id: string) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      sku: formData.sku,
      barcode: formData.barcode || undefined,
      valuationMethod: formData.valuationMethod,
      openingStock: parseFloat(formData.openingStock) || 0,
      categoryId: formData.categoryId !== "none" ? formData.categoryId : undefined,
      uomId: formData.uomId !== "none" ? formData.uomId : undefined,
      sellingPrice: parseFloat(formData.sellingPrice) || 0,
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      gstPercentage: parseFloat(formData.gstPercentage) || 0,
      hsnCode: formData.hsnCode || undefined,
      lowStockThreshold: parseInt(formData.lowStockThreshold, 10) || 0,
    };

    if (editingProd) {
      await updateMutation.mutateAsync({ id: editingProd.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setFormOpen(false);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await deleteMutation.mutateAsync(deletingId);
      setDeleteOpen(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const lower = search.toLowerCase();
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(lower) || p.sku.toLowerCase().includes(lower);
      const matchesStock = showLowStockOnly ? (p.currentStock ?? 0) <= p.lowStockThreshold : true; 
      return matchesSearch && matchesStock;
    });
  }, [products, search, showLowStockOnly]);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-4 w-full max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or SKU..."
              className="pl-8 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button 
            variant={showLowStockOnly ? "default" : "outline"} 
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className="whitespace-nowrap"
          >
            Low Stock Only
          </Button>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus size={16} /> Add Product
        </Button>
      </div>

      <div className="border border-border rounded-md overflow-hidden bg-background">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>UOM</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="animate-spin mx-auto text-muted-foreground" size={24} />
                </TableCell>
              </TableRow>
            ) : filteredProducts?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts?.map((prod) => (
                <TableRow key={prod.id}>
                  <TableCell className="font-medium text-xs text-muted-foreground">{prod.sku}</TableCell>
                  <TableCell className="font-medium">{prod.name}</TableCell>
                  <TableCell>{prod.category?.name || "-"}</TableCell>
                  <TableCell>{prod.uom?.symbol || "-"}</TableCell>
                  <TableCell className="text-right font-medium text-primary">{prod.currentStock ?? 0}</TableCell>
                  <TableCell className="text-right">₹{Number(prod.sellingPrice).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(prod)}>
                        <Edit2 size={16} className="text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDelete(prod.id)}>
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>{editingProd ? "Edit Product" : "Add Product"}</DialogTitle>
              <DialogDescription>
                Fill in the product details. Fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="p-name">Name <span className="text-destructive">*</span></Label>
                <Input
                  id="p-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="p-sku">SKU <span className="text-destructive">*</span></Label>
                <Input
                  id="p-sku" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="p-barcode">Barcode</Label>
                <div className="flex gap-2">
                  <Input
                    id="p-barcode" value={formData.barcode} onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} placeholder="Scan or type"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => setScanOpen(true)}>
                    <Camera size={16} />
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Valuation Method</Label>
                <Select value={formData.valuationMethod} onValueChange={(val) => setFormData({ ...formData, valuationMethod: val })}>
                  <SelectTrigger><SelectValue placeholder="Select Method" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEIGHTED_AVERAGE">Weighted Average</SelectItem>
                    <SelectItem value="FIFO">FIFO</SelectItem>
                    <SelectItem value="LIFO">LIFO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!editingProd && (
                <div className="grid gap-2">
                  <Label htmlFor="p-openstock">Opening Stock</Label>
                  <Input
                    id="p-openstock" type="number" step="1" value={formData.openingStock} onChange={(e) => setFormData({ ...formData, openingStock: e.target.value })} placeholder="Initial quantity"
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={formData.categoryId} onValueChange={(val) => setFormData({ ...formData, categoryId: val })}>
                  <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>UOM</Label>
                <Select value={formData.uomId} onValueChange={(val) => setFormData({ ...formData, uomId: val })}>
                  <SelectTrigger><SelectValue placeholder="Select UOM" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {uoms?.map((u) => <SelectItem key={u.id} value={u.id}>{u.symbol} - {u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="p-sell">Selling Price <span className="text-destructive">*</span></Label>
                <Input
                  id="p-sell" type="number" step="0.01" value={formData.sellingPrice} onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })} required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="p-purch">Purchase Price <span className="text-destructive">*</span></Label>
                <Input
                  id="p-purch" type="number" step="0.01" value={formData.purchasePrice} onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })} required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="p-gst">GST %</Label>
                <Input
                  id="p-gst" type="number" step="0.01" value={formData.gstPercentage} onChange={(e) => setFormData({ ...formData, gstPercentage: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="p-hsn">HSN Code</Label>
                <Input
                  id="p-hsn" value={formData.hsnCode} onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                />
              </div>

              <div className="grid gap-2 cols-span-2">
                <Label htmlFor="p-low">Low Stock Threshold</Label>
                <Input
                  id="p-low" type="number" value={formData.lowStockThreshold} onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || !formData.name.trim() || !formData.sku.trim() || !formData.sellingPrice}>
                {isSaving && <Loader2 size={16} className="animate-spin mr-2" />}
                {editingProd ? "Save Changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure? This action cannot be undone and will remove the product permanently.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 size={16} className="animate-spin mr-2" />}
              Yes, delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scanner Modal */}
      <Dialog open={scanOpen} onOpenChange={setScanOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Scan Barcode</DialogTitle>
            <DialogDescription>Point your camera at the product barcode.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {scanOpen && (
              <BarcodeScanner 
                onScan={(code) => {
                  setFormData(prev => ({ ...prev, barcode: code }));
                  setScanOpen(false);
                }} 
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScanOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
