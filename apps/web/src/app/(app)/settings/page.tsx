"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const GST_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function SettingsPage() {
  const { activeShop, refreshShops } = useAuth();
  const [form, setForm] = useState({
    name: "",
    gstNumber: "",
    address: "",
    financialYearStartMonth: 4,
  });
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);

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
    </div>
  );
}
