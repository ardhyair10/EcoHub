"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, ArrowLeft, Building2, Scale, TreePine, Recycle, Check, Loader2, Send, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";
import { safeFetchJson } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface StockItem {
  category_id: string;
  category_name: string;
  point_per_kg: number;
  total_weight_kg: number;
  transaction_count: number;
  est_carbon_saved_kg: number;
}

interface Summary {
  total_weight_kg: number;
  total_carbon_saved_kg: number;
  total_categories: number;
}

export default function B2BPage() {
  const router = useRouter();
  const [stock, setStock] = useState<StockItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [targetWeight, setTargetWeight] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await fetch(`${API}/api/b2b/waste-stock`);
        const data = await safeFetchJson(res);
        if (data.success) {
          setStock(data.data.stock);
          setSummary(data.data.summary);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, []);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !selectedCategory || !targetWeight) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch(`${API}/api/b2b/buy-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          waste_category_id: selectedCategory,
          target_weight_kg: parseFloat(targetWeight),
        }),
      });

      const data = await safeFetchJson(res);
      if (data.success) {
        setMessage({ type: "success", text: data.message || "Permintaan berhasil dikirim!" });
        setSelectedCategory("");
        setTargetWeight("");
      } else {
        setMessage({ type: "error", text: data.message || "Gagal mengirim permintaan" });
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan koneksi" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-50 px-6 h-16 flex items-center gap-4 border-b border-slate-200 dark:border-slate-800  bg-card ">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <span className="font-heading font-bold text-lg">B2B Bulk Waste Hub</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <NotificationBell />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              router.push("/login");
            }}
            className="gap-1.5 text-muted-foreground hover:text-red-500 font-semibold"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log Out</span>
          </Button>
          <span className="text-xs font-bold uppercase text-sky-600 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full">
            Mitra B2B
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-lg p-6 sm:p-8 text-white border border-slate-800 shadow-sm mb-8">
          <div className="max-w-xl space-y-2">
            <span className="px-3 py-1 rounded-full bg-secondary/20 border border-secondary/40 text-secondary text-xs font-bold uppercase">
              B2B Circular Economy
            </span>
            <h1 className="text-3xl font-heading font-black">Stok Sampah Terkumpul RW</h1>
            <p className="text-sm text-foreground leading-relaxed">
              Hub penghubung antara pos penampungan sampah RW dan industri daur ulang bulk. Dapatkan bahan baku daur ulang berkualitas secara terintegrasi.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Scale className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground">{summary.total_weight_kg} kg</p>
                <p className="text-xs text-muted-foreground font-medium">Total Sampah Terkumpul</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                <TreePine className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">-{summary.total_carbon_saved_kg} kg</p>
                <p className="text-xs text-muted-foreground font-medium">Estimasi CO₂ Dihemat</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                <Recycle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground">{summary.total_categories}</p>
                <p className="text-xs text-muted-foreground font-medium">Kategori Ketersediaan</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stock Table */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <h2 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                <Recycle className="h-5 w-5 text-primary" /> Ketersediaan Stok per Kategori
              </h2>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : stock.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Belum ada stok sampah terkumpul.</p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stock.map((item) => (
                    <div key={item.category_id} className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-foreground">{item.category_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.transaction_count} transaksi penimbangan warga
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-primary">{item.total_weight_kg} kg</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">-{item.est_carbon_saved_kg}kg CO₂</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: B2B Buy Request Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <h2 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5 text-secondary" /> Pengajuan Pembelian Bulk
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Kirim pengajuan ke pengurus RW untuk pembelian/penjemputan sampah daur ulang skala besar.
              </p>

              {message && (
                <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${message.type === "success" ? "bg-primary/10 text-primary border border-primary/20" : "bg-destructive/10 text-destructive border border-destructive/20"}`}>
                  {message.type === "success" ? <Check className="h-4 w-4" /> : null}
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Kategori Sampah</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    required
                    className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {stock.map((s) => (
                      <option key={s.category_id} value={s.category_id}>
                        {s.category_name} (Tersedia: {s.total_weight_kg} kg)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Target Berat (kg)</label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Contoh: 100"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full font-bold gap-2 h-11" disabled={submitting || !selectedCategory}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Kirim Pengajuan
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
