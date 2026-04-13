"use client";

import { useState } from "react";
import { useUoms, useCreateUom, useUpdateUom, useDeleteUom, Uom } from "@/hooks/use-inventory";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";

export function UomTab() {
  const { data: uoms, isLoading } = useUoms();
  const createMutation = useCreateUom();
  const updateMutation = useUpdateUom();
  const deleteMutation = useDeleteUom();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingUom, setEditingUom] = useState<Uom | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: "", symbol: "" });

  const openAdd = () => {
    setEditingUom(null);
    setFormData({ name: "", symbol: "" });
    setFormOpen(true);
  };

  const openEdit = (uom: Uom) => {
    setEditingUom(uom);
    setFormData({ name: uom.name, symbol: uom.symbol });
    setFormOpen(true);
  };

  const openDelete = (id: string) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUom) {
      await updateMutation.mutateAsync({ id: editingUom.id, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setFormOpen(false);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await deleteMutation.mutateAsync(deletingId);
      setDeleteOpen(false);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-lg font-medium">Units of Measure (UOM)</h2>
          <p className="text-sm text-muted-foreground">Define measurement units for your inventory (e.g. KG, PCS).</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus size={16} /> Add UOM
        </Button>
      </div>

      <div className="border border-border rounded-md overflow-hidden bg-background">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  <Loader2 className="animate-spin mx-auto text-muted-foreground" size={24} />
                </TableCell>
              </TableRow>
            ) : uoms?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No units found. Create one.
                </TableCell>
              </TableRow>
            ) : (
              uoms?.map((uom) => (
                <TableRow key={uom.id}>
                  <TableCell className="font-medium">{uom.name}</TableCell>
                  <TableCell className="text-muted-foreground">{uom.symbol}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(uom)}>
                        <Edit2 size={16} className="text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDelete(uom.id)}>
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
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>{editingUom ? "Edit UOM" : "Add UOM"}</DialogTitle>
              <DialogDescription>
                {editingUom ? "Update the details of your unit of measure." : "Create a new unit of measure for tracking stock."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="u-name">Name <span className="text-destructive">*</span></Label>
                <Input
                  id="u-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Kilograms"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="u-symbol">Symbol <span className="text-destructive">*</span></Label>
                <Input
                  id="u-symbol"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  placeholder="e.g. KG"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || !formData.name.trim() || !formData.symbol.trim()}>
                {isSaving && <Loader2 size={16} className="animate-spin mr-2" />}
                {editingUom ? "Save Changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete UOM</DialogTitle>
            <DialogDescription>
              Are you sure? This action cannot be undone. Products using this UOM might lose their measurement structure.
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
    </div>
  );
}
