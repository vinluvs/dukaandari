"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Store } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const GST_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { refreshShops } = useAuth();

  const [form, setForm] = useState({
    name: "",
    gstNumber: "",
    address: "",
    financialYearStartMonth: 4,
  });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Shop name is required"); return; }
    setLoading(true);
    try {
      await api.post("/shops", {
        name: form.name,
        gstNumber: form.gstNumber || undefined,
        address: form.address || undefined,
        financialYearStartMonth: Number(form.financialYearStartMonth),
      });
      await refreshShops();
      toast.success("Shop created! Welcome to Dukaandari 🎉");
      router.push("/pos");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to create shop");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Store size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold leading-none">Set up your shop</h1>
          <p className="text-sm text-muted-foreground mt-0.5">You can always update this later</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="shopName">Shop Name <span className="text-destructive">*</span></label>
          <input
            id="shopName" type="text" required value={form.name} onChange={set("name")}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
            placeholder="My Shop"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="gstNumber">GST Number (optional)</label>
          <input
            id="gstNumber" type="text" value={form.gstNumber} onChange={set("gstNumber")}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
            placeholder="22AAAAA0000A1Z5"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="address">Address (optional)</label>
          <input
            id="address" type="text" value={form.address} onChange={set("address")}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
            placeholder="123, Market Street, Mumbai"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="fyMonth">Financial Year Start</label>
          <select
            id="fyMonth"
            value={form.financialYearStartMonth}
            onChange={set("financialYearStartMonth")}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
          >
            {GST_MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">Default is April (Indian financial year)</p>
        </div>

        <motion.button
          type="submit" disabled={loading}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60 transition"
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          Create shop &amp; continue
        </motion.button>
      </form>
    </motion.div>
  );
}
