"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertTriangle, Trash2, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const GST_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function SettingsPage() {
  const router = useRouter();
  const { activeShop, refreshShops } = useAuth();
  const [form, setForm] = useState({
    name: "",
    gstNumber: "",
    address: "",
    financialYearStartMonth: 4,
  });
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (activeShop) {
      setForm({
        name: activeShop.name,
        gstNumber: activeShop.gstNumber ?? "",
        address: activeShop.address ?? "",
        financialYearStartMonth: activeShop.financialYearStartMonth,
      });
    }
  }, [activeShop]);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      setDirty(true);
    };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!activeShop) return;
    setLoading(true);
    try {
      await api.patch(`/shops/${activeShop.id}`, {
        name: form.name,
        gstNumber: form.gstNumber || undefined,
        address: form.address || undefined,
        financialYearStartMonth: Number(form.financialYearStartMonth),
      });
      await refreshShops();
      toast.success("Shop settings saved");
      setDirty(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update shop");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetData() {
    if (!activeShop) return;
    setResetLoading(true);
    try {
      await api.post(`/shops/${activeShop.id}/reset?shop_id=${activeShop.id}`);
      toast.success("All shop data has been cleared");
      setResetDialogOpen(false);
      // Optional: redirect to dashboard
      router.push("/pos");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to reset shop data");
    } finally {
      setResetLoading(false);
    }
  }

  async function handleDeleteShop() {
    if (!activeShop) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/shops/${activeShop.id}?shop_id=${activeShop.id}`);
      toast.success("Shop deleted successfully");
      setDeleteDialogOpen(false);
      await refreshShops();
      router.push("/");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to delete shop");
    } finally {
      setDeleteLoading(false);
    }
  }

  if (!activeShop) {
    return (
      <div className="max-w-lg">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground text-sm">No shop selected. Create one first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto w-full mt-4 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your shop details</p>
      </div>

      <form onSubmit={handleSave} className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="font-medium">Shop Information</h2>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="s-name">Shop Name <span className="text-destructive">*</span></label>
          <input
            id="s-name" type="text" required value={form.name} onChange={set("name")}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="s-gst">GST Number</label>
          <input
            id="s-gst" type="text" value={form.gstNumber} onChange={set("gstNumber")}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
            placeholder="22AAAAA0000A1Z5"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="s-address">Address</label>
          <input
            id="s-address" type="text" value={form.address} onChange={set("address")}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="s-fy">Financial Year Start Month</label>
          <select
            id="s-fy" value={form.financialYearStartMonth} onChange={set("financialYearStartMonth")}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
          >
            {GST_MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>

        <motion.button
          type="submit" disabled={loading || !dirty}
          whileHover={{ scale: dirty ? 1.01 : 1 }} whileTap={{ scale: dirty ? 0.99 : 1 }}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 transition"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          Save changes
        </motion.button>
      </form>

      <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle size={20} />
          <h2 className="font-semibold text-lg">Danger Zone</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          These actions are destructive and cannot be undone. Please proceed with caution.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            className="flex-1 border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setResetDialogOpen(true)}
          >
            <RefreshCcw size={16} className="mr-2" />
            Reset All Data
          </Button>
          <Button 
            variant="destructive" 
            className="flex-1"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 size={16} className="mr-2" />
            Delete Shop Entirely
          </Button>
        </div>
      </div>

      {/* Reset Data Confirmation */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Shop Data?</DialogTitle>
            <DialogDescription>
              This will permanently delete all invoices, products, customers, and ledger entries for <strong>{activeShop.name}</strong>. The shop itself will not be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleResetData} disabled={resetLoading}>
              {resetLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Confirm Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Shop Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Shop Entirely?</DialogTitle>
            <DialogDescription>
              This will permanently delete the shop <strong>{activeShop.name}</strong> and all its associated data. This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteShop} disabled={deleteLoading}>
              {deleteLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
