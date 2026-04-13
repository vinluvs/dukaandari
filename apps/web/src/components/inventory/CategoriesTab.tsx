"use client";

import { useState } from "react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, Category } from "@/hooks/use-inventory";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";

export function CategoriesTab() {
  const { data: categories, isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: "", description: "" });

  const openAdd = () => {
    setEditingCat(null);
    setFormData({ name: "", description: "" });
    setFormOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCat(cat);
    setFormData({ name: cat.name, description: cat.description || "" });
    setFormOpen(true);
  };

  const openDelete = (id: string) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCat) {
      await updateMutation.mutateAsync({ id: editingCat.id, ...formData });
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
          <h2 className="text-lg font-medium">Categories</h2>
          <p className="text-sm text-muted-foreground">Organize your products into categories.</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus size={16} /> Add Category
        </Button>
      </div>

      <div className="border border-border rounded-md overflow-hidden bg-background">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
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
            ) : categories?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No categories found. Create one.
                </TableCell>
              </TableRow>
            ) : (
              categories?.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground">{cat.description || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                        <Edit2 size={16} className="text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDelete(cat.id)}>
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
              <DialogTitle>{editingCat ? "Edit Category" : "Add Category"}</DialogTitle>
              <DialogDescription>
                {editingCat ? "Update the details of your category." : "Create a new category to group your products."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="c-name">Name <span className="text-destructive">*</span></Label>
                <Input
                  id="c-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Vegetables"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="c-desc">Description</Label>
                <Input
                  id="c-desc"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional details"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || !formData.name.trim()}>
                {isSaving && <Loader2 size={16} className="animate-spin mr-2" />}
                {editingCat ? "Save Changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure? This action cannot be undone. Products belonging to this category might lose their category association.
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
