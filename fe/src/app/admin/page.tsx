"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Leaf,
  Search,
  Check,
  ArrowLeft,
  Recycle,
  User,
  Award,
  Scale,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CitizenUser {
  id: string;
  name: string;
  email: string;
  eco_points: number;
  qr_code_id: string;
}

interface WasteCategory {
  id: string;
  name: string;
  point_per_kg: number;
  description?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CitizenUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CitizenUser | null>(null);

  // Categories
  const [categories, setCategories] = useState<WasteCategory[]>([]);

  // Form state
  const [categoryId, setCategoryId] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!t) { router.push("/login"); return; }

    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || user.role !== "ADMIN_RW") {
      router.push("/dashboard");
      return;
    }
    setToken(t);

    // Fetch waste categories
    fetch("http://localhost:5000/api/waste-categories")
      .then((r) => r.json())
      .then((d) => { if (d.success) setCategories(d.data); });
  }, [router]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(
        `http://localhost:5000/api/users/search?q=${encodeURIComponent(searchQuery)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) setSearchResults(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  }, [searchQuery, token]);

  // Hitung preview poin
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const previewPoints =
    selectedCategory && parseFloat(weightKg) > 0
      ? Math.round(parseFloat(weightKg) * selectedCategory.point_per_kg)
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !categoryId || !weightKg) return;

    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          citizen_id: selectedUser.id,
          waste_category_id: categoryId,
          weight_kg: parseFloat(weightKg),
          notes: notes || undefined,
        }),
      });

      const data = await res.json();
      setResult({ success: data.success, message: data.message });

      if (data.success) {
        // Reset form, update displayed points
        setSelectedUser((u) => u ? { ...u, eco_points: u.eco_points + (previewPoints ?? 0) } : u);
        setCategoryId("");
        setWeightKg("");
        setNotes("");
      }
    } catch (err) {
      setResult({ success: false, message: "Terjadi kesalahan koneksi" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navbar */}
      <header className="sticky top-0 z-50 px-6 h-16 flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-primary" />
          <span className="font-heading font-bold text-lg">Input Transaksi Sampah</span>
        </div>
        <span className="ml-auto text-xs font-bold uppercase text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
          Admin RW
        </span>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Step 1: Cari User */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm font-black">1</div>
            <h2 className="font-heading font-bold text-foreground">Cari Warga</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Masukkan nama, email, atau QR ID warga yang ingin menyetorkan sampah.
          </p>

          <div className="flex gap-2">
            <Input
              placeholder="Cari nama / email / QR ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={searching} className="gap-2">
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Cari
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && !selectedUser && (
            <div className="mt-3 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              {searchResults.map((u) => (
                <button
                  key={u.id}
                  onClick={() => { setSelectedUser(u); setSearchResults([]); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                >
                  <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <span className="text-xs font-bold text-primary">{u.eco_points} pts</span>
                </button>
              ))}
            </div>
          )}

          {/* Selected User */}
          {selectedUser && (
            <div className="mt-3 bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground">{selectedUser.name}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Saat ini</p>
                <p className="font-bold text-primary">{selectedUser.eco_points} pts</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Form Transaksi */}
        <div className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-opacity ${!selectedUser ? "opacity-50 pointer-events-none" : ""}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm font-black">2</div>
            <h2 className="font-heading font-bold text-foreground">Detail Sampah</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category */}
            <div className="space-y-2">
              <Label className="font-semibold flex items-center gap-2">
                <Recycle className="h-4 w-4 text-primary" />
                Kategori Sampah
              </Label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                <option value="">-- Pilih kategori --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.point_per_kg} pts/kg)
                  </option>
                ))}
              </select>
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label className="font-semibold flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" />
                Berat (kg)
              </Label>
              <Input
                type="number"
                min="0.1"
                step="0.1"
                placeholder="Contoh: 2.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                required
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="font-semibold text-muted-foreground">Catatan (opsional)</Label>
              <Input
                placeholder="Misal: kondisi sampah bersih / kering"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Preview Poin */}
            {previewPoints !== null && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Poin yang akan diberikan:</span>
                </div>
                <span className="text-2xl font-black text-primary">+{previewPoints}</span>
              </div>
            )}

            {/* Result message */}
            {result && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${result.success ? "bg-primary/10 text-primary border border-primary/20" : "bg-destructive/10 text-destructive border border-destructive/20"}`}>
                {result.success ? <Check className="h-4 w-4 flex-shrink-0" /> : <X className="h-4 w-4 flex-shrink-0" />}
                {result.message}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold gap-2"
              disabled={submitting || !selectedUser}
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</>
              ) : (
                <><Check className="h-4 w-4" /> Catat Transaksi</>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
