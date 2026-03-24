"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ fullName: user?.fullName ?? "", phone: user?.phone ?? "" });
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setDirty(true);
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch("/profile", { fullName: form.fullName, phone: form.phone || undefined });
      await refreshUser();
      toast.success("Profile updated");
      setDirty(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto w-full mt-4 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="text-sm text-muted-foreground">Manage your personal details</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
        <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-semibold">
          {user?.fullName?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? <User size={24} />}
        </div>
        <div>
          <p className="font-medium">{user?.fullName}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSave} className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="font-medium">Personal Information</h2>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="acc-fullName">Full Name</label>
          <input
            id="acc-fullName" type="text" required value={form.fullName} onChange={set("fullName")}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email" disabled value={user?.email ?? ""}
            className="w-full px-3 py-2 rounded-md border border-input bg-muted text-sm text-muted-foreground cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground">Email cannot be changed</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="acc-phone">Phone</label>
          <input
            id="acc-phone" type="tel" value={form.phone} onChange={set("phone")}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
            placeholder="+91 98765 43210"
          />
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
