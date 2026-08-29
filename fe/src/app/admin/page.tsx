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
  History,
  ChevronLeft,
  ChevronRight,
  Calendar,
  LogOut,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StatusBadge from "@/components/ui/status-badge";
import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { safeFetchJson } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface CitizenUser {
  id: string;
  name: string;
  email: string;
  eco_points: number;
  qr_code_id: string;
  _count?: { transactions_as_citizen: number };
  last_transaction?: string;
  transactions_as_citizen?: any[]; // For slide-out detail
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
  const [activeTab, setActiveTab] = useState<"input" | "warga" | "riwayat" | "b2b">("input");

  // --- Tab 1: Input Sampah State ---
  const [inputSearchQuery, setInputSearchQuery] = useState("");
  const [inputSearchResults, setInputSearchResults] = useState<CitizenUser[]>([]);
  const [inputSearching, setInputSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CitizenUser | null>(null);

  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // --- Tab 2: Daftar Warga State ---
  const [wargaList, setWargaList] = useState<CitizenUser[]>([]);
  const [wargaSearch, setWargaSearch] = useState("");
  const [wargaPage, setWargaPage] = useState(1);
  const [wargaTotalPages, setWargaTotalPages] = useState(1);
  const [wargaLoading, setWargaLoading] = useState(false);
  const [selectedCitizenDetail, setSelectedCitizenDetail] = useState<CitizenUser | null>(null);

  // --- Tab 3: Riwayat Transaksi State ---
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [txLoading, setTxLoading] = useState(false);
  const [txValidating, setTxValidating] = useState<string | null>(null);

  // --- Tab 4: Pesanan B2B State ---
  const [b2bRequests, setB2bRequests] = useState<any[]>([]);
  const [b2bApproving, setB2bApproving] = useState<string | null>(null);

  const fetchB2bRequests = useCallback(async () => {
    const t = localStorage.getItem("token");
    if (!t) return;
    try {
      const res = await fetch(`${API_URL}/api/b2b/requests`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const d = await safeFetchJson(res);
      if (d.success) setB2bRequests(d.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleApproveB2b = async (id: string) => {
    const t = localStorage.getItem("token");
    if (!t) return;
    try {
      setB2bApproving(id);
      const res = await fetch(`${API_URL}/api/b2b/requests/${id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${t}` },
      });
      const d = await safeFetchJson(res);
      if (d.success) {
        setB2bRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: "APPROVED" } : r))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setB2bApproving(null);
    }
  };

  // Initial Auth & Load Categories
  useEffect(() => {
    const t = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!t) {
      router.push("/login");
      return;
    }

    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || user.role !== "ADMIN_RW") {
      router.push("/dashboard");
      return;
    }
    setToken(t);

    fetch(`${API_URL}/api/waste-categories`)
      .then(safeFetchJson)
      .then((d) => {
        if (d.success) setCategories(d.data);
      })
      .catch(console.error);
  }, [router]);

  // ==========================================
  // TAB 1: INPUT SAMPAH LOGIC
  // ==========================================
  const handleInputSearch = async () => {
    if (!inputSearchQuery.trim() || inputSearchQuery.trim().length < 2) return;
    setInputSearching(true);
    setInputSearchResults([]);
    try {
      const res = await fetch(
        `${API_URL}/api/users/search?q=${encodeURIComponent(inputSearchQuery)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await safeFetchJson(res);
      if (data.success) setInputSearchResults(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setInputSearching(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const previewPoints =
    selectedCategory && parseFloat(weightKg) > 0
      ? Math.round(parseFloat(weightKg) * selectedCategory.point_per_kg)
      : null;

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !categoryId || !weightKg) return;

    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/api/transactions`, {
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

      const data = await safeFetchJson(res);
      setResult({ success: data.success, message: data.message });

      if (data.success) {
        setSelectedUser((u) =>
          u ? { ...u, eco_points: u.eco_points + (previewPoints ?? 0) } : u
        );
        setCategoryId("");
        setWeightKg("");
        setNotes("");
        // Clear recent transactions to enforce refetch
        setTransactions([]);
      }
    } catch (err) {
      setResult({ success: false, message: "Terjadi kesalahan koneksi" });
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // TAB 2: DAFTAR WARGA LOGIC
  // ==========================================
  const fetchWarga = async (page = 1, search = wargaSearch) => {
    if (!token) return;
    setWargaLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/users/citizens?page=${page}&q=${encodeURIComponent(search)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const d = await safeFetchJson(res);
      if (d.success) {
        setWargaList(d.data.citizens);
        setWargaTotalPages(d.data.pagination.totalPages);
        setWargaPage(page);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWargaLoading(false);
    }
  };

  const openCitizenDetail = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/users/citizens/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await safeFetchJson(res);
      if (d.success) setSelectedCitizenDetail(d.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================
  // TAB 3: RIWAYAT TRANSAKSI LOGIC
  // ==========================================
  const fetchTransactions = async (page = 1) => {
    if (!token) return;
    setTxLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/transactions?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await safeFetchJson(res);
      if (d.success) {
        setTransactions(d.data.transactions);
        setTxTotalPages(d.data.pagination.totalPages);
        setTxPage(page);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTxLoading(false);
    }
  };

  const validateTransaction = async (id: string) => {
    if (!token) return;
    setTxValidating(id);
    try {
      const res = await fetch(`${API_URL}/api/transactions/${id}/validate`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await safeFetchJson(res);
      if (d.success) {
        setTransactions((txs) =>
          txs.map((tx) => (tx.id === id ? { ...tx, status: "VALIDATED" } : tx))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTxValidating(null);
    }
  };

  // Handle lazy loading tabs
  useEffect(() => {
    if (activeTab === "warga") fetchWarga(1);
    if (activeTab === "riwayat") fetchTransactions(1);
    if (activeTab === "b2b") fetchB2bRequests();
  }, [activeTab, fetchWarga, fetchTransactions, fetchB2bRequests]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navbar */}
      <header className="sticky top-0 z-40 px-6 h-16 flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-primary" />
          <span className="font-heading font-bold text-lg">Admin Panel RW 05</span>
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
          <span className="text-xs font-bold uppercase text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            Admin RW
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* CSS-only Tab Navigation */}
        <div className="flex bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl p-1 mb-6 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("input")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "input"
                ? "bg-white dark:bg-slate-900 shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <Recycle className="h-4 w-4" /> Input Sampah
          </button>
          <button
            onClick={() => setActiveTab("warga")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "warga"
                ? "bg-white dark:bg-slate-900 shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <User className="h-4 w-4" /> Daftar Warga
          </button>
          <button
            onClick={() => setActiveTab("riwayat")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "riwayat"
                ? "bg-white dark:bg-slate-900 shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <History className="h-4 w-4" /> Riwayat
          </button>
          <button
            onClick={() => setActiveTab("b2b")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "b2b"
                ? "bg-white dark:bg-slate-900 shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <Building2 className="h-4 w-4 text-sky-500" /> Pesanan B2B
          </button>
        </div>

        {/* ========================================== */}
        {/* TAB 1 CONTENT: INPUT SAMPAH */}
        {/* ========================================== */}
        {activeTab === "input" && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Step 1: Cari User */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm font-black">
                  1
                </div>
                <h2 className="font-heading font-bold text-foreground">Cari Warga</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Masukkan nama, email, atau QR ID warga yang ingin menyetorkan sampah.
              </p>

              <div className="flex gap-2">
                <Input
                  placeholder="Cari nama / email / QR ID..."
                  value={inputSearchQuery}
                  onChange={(e) => setInputSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInputSearch()}
                  className="flex-1"
                />
                <Button onClick={handleInputSearch} disabled={inputSearching} className="gap-2">
                  {inputSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Cari
                </Button>
              </div>

              {/* Search Results */}
              {inputSearchResults.length > 0 && !selectedUser && (
                <div className="mt-3 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {inputSearchResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setSelectedUser(u);
                        setInputSearchResults([]);
                      }}
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
            <div
              className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-opacity ${
                !selectedUser ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm font-black">
                  2
                </div>
                <h2 className="font-heading font-bold text-foreground">Detail Sampah</h2>
              </div>

              <form onSubmit={handleInputSubmit} className="space-y-4">
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
                      <span className="text-sm font-semibold text-foreground">Poin diberikan:</span>
                    </div>
                    <span className="text-2xl font-black text-primary">+{previewPoints}</span>
                  </div>
                )}

                {/* Result message */}
                {result && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
                      result.success
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-destructive/10 text-destructive border border-destructive/20"
                    }`}
                  >
                    {result.success ? (
                      <Check className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <X className="h-4 w-4 flex-shrink-0" />
                    )}
                    {result.message}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-bold gap-2"
                  disabled={submitting || !selectedUser}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" /> Catat Transaksi
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2 CONTENT: DAFTAR WARGA */}
        {/* ========================================== */}
        {activeTab === "warga" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex gap-2">
              <Input
                placeholder="Cari nama atau email warga..."
                value={wargaSearch}
                onChange={(e) => setWargaSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchWarga(1)}
                className="max-w-sm"
              />
              <Button onClick={() => fetchWarga(1)} disabled={wargaLoading} variant="secondary">
                <Search className="h-4 w-4 mr-2" /> Cari
              </Button>
            </div>

            {wargaLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium">
                        <tr>
                          <th className="px-6 py-4">Warga</th>
                          <th className="px-6 py-4 text-center">Total Transaksi</th>
                          <th className="px-6 py-4">Terakhir Aktif</th>
                          <th className="px-6 py-4 text-right">Eco Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {wargaList.map((w) => (
                          <tr
                            key={w.id}
                            onClick={() => openCitizenDetail(w.id)}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex flex-shrink-0 items-center justify-center font-bold">
                                  {w.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground">{w.name}</p>
                                  <p className="text-xs text-muted-foreground">{w.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center text-muted-foreground">
                              {w._count?.transactions_as_citizen || 0}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {w.last_transaction
                                ? new Date(w.last_transaction).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "-"}
                            </td>
                            <td className="px-6 py-4 font-bold text-primary text-right">
                              {w.eco_points}
                            </td>
                          </tr>
                        ))}
                        {wargaList.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                              Tidak ada warga ditemukan.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {wargaTotalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => fetchWarga(wargaPage - 1)}
                      disabled={wargaPage === 1}
                      className="rounded-full"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground font-medium">
                      Halaman {wargaPage} dari {wargaTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => fetchWarga(wargaPage + 1)}
                      disabled={wargaPage === wargaTotalPages}
                      className="rounded-full"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Slide-out Warga Detail */}
            {selectedCitizenDetail && (
              <>
                <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[420px] bg-white dark:bg-slate-950 shadow-2xl border-l border-slate-200 dark:border-slate-800 overflow-y-auto transform transition-transform duration-300 translate-x-0">
                  <div className="sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-10">
                    <h3 className="font-heading font-bold text-lg">Detail Warga</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedCitizenDetail(null)}
                      className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-2xl">
                        {selectedCitizenDetail.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-xl text-foreground">
                          {selectedCitizenDetail.name}
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          {selectedCitizenDetail.email}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">
                          Total Poin
                        </p>
                        <p className="font-black text-2xl text-primary">
                          {selectedCitizenDetail.eco_points}
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">
                          Transaksi
                        </p>
                        <p className="font-black text-2xl text-foreground">
                          {selectedCitizenDetail._count?.transactions_as_citizen || 0}
                        </p>
                      </div>
                    </div>

                    <h5 className="font-bold text-sm text-foreground mb-4 flex items-center gap-2">
                      <History className="h-4 w-4" /> 10 Transaksi Terakhir
                    </h5>

                    <div className="space-y-3">
                      {!selectedCitizenDetail.transactions_as_citizen ||
                      selectedCitizenDetail.transactions_as_citizen.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
                          Belum ada transaksi.
                        </p>
                      ) : (
                        selectedCitizenDetail.transactions_as_citizen.map((tx: any) => (
                          <div
                            key={tx.id}
                            className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-semibold text-sm">
                                {tx.waste_category.name}
                              </span>
                              <StatusBadge status={tx.status} />
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Scale className="h-3.5 w-3.5" /> {tx.weight_kg} kg
                              </span>
                              <span className="font-bold text-primary">
                                +{tx.points_awarded} pts
                              </span>
                            </div>
                            <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-[11px] text-muted-foreground flex items-center gap-1.5">
                              <Calendar className="h-3 w-3" />{" "}
                              {new Date(tx.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40 bg-black/20 dark:bg-black/50 backdrop-blur-sm transition-opacity"
                  onClick={() => setSelectedCitizenDetail(null)}
                />
              </>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3 CONTENT: RIWAYAT TRANSAKSI */}
        {/* ========================================== */}
        {activeTab === "riwayat" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {txLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium">
                        <tr>
                          <th className="px-6 py-4">Warga & Status</th>
                          <th className="px-6 py-4">Kategori & Berat</th>
                          <th className="px-6 py-4">Poin</th>
                          <th className="px-6 py-4">Tanggal</th>
                          <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {transactions.map((tx) => (
                          <tr
                            key={tx.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="font-semibold text-foreground mb-1">
                                {tx.citizen.name}
                              </div>
                              <StatusBadge status={tx.status} />
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-foreground">
                                {tx.waste_category.name}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Scale className="h-3 w-3" /> {tx.weight_kg} kg
                              </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-primary">
                              +{tx.points_awarded} pts
                            </td>
                            <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
                              {new Date(tx.created_at).toLocaleString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {tx.status === "PENDING" ? (
                                <Button
                                  size="sm"
                                  onClick={() => validateTransaction(tx.id)}
                                  disabled={txValidating === tx.id}
                                  className="rounded-full shadow-sm"
                                >
                                  {txValidating === tx.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                  ) : (
                                    <Check className="h-4 w-4 mr-1" />
                                  )}
                                  Validasi
                                </Button>
                              ) : (
                                <span className="text-xs font-medium text-muted-foreground flex items-center justify-end gap-1">
                                  <Check className="h-3.5 w-3.5" /> Selesai
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {transactions.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                              Tidak ada riwayat transaksi.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {txTotalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => fetchTransactions(txPage - 1)}
                      disabled={txPage === 1}
                      className="rounded-full"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground font-medium">
                      Halaman {txPage} dari {txTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => fetchTransactions(txPage + 1)}
                      disabled={txPage === txTotalPages}
                      className="rounded-full"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 4 CONTENT: PESANAN B2B INDUSTRI */}
        {/* ========================================== */}
        {activeTab === "b2b" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-sky-500" />
                  <h2 className="font-heading font-bold text-lg text-foreground">
                    Pengajuan Pembelian Industri B2B
                  </h2>
                </div>
                <Button variant="outline" size="sm" onClick={fetchB2bRequests} className="text-xs">
                  Refresh Data
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                Daftar pengajuan pembelian & penjemputan sampah daur ulang skala bulk dari mitra industri daur ulang.
              </p>

              {b2bRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  Belum ada pengajuan pembelian B2B dari industri.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {b2bRequests.map((reqItem) => (
                    <div key={reqItem.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">{reqItem.buyer_name}</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            reqItem.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {reqItem.status === 'APPROVED' ? 'Disetujui Admin' : 'Menunggu Persetujuan'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Kategori: <strong className="text-foreground">{reqItem.category_name}</strong> · Target: <strong className="text-primary">{reqItem.target_weight_kg} kg</strong>
                        </p>
                        {reqItem.notes && (
                          <p className="text-xs text-slate-500 italic">Catatan: {reqItem.notes}</p>
                        )}
                        <p className="text-[10px] text-slate-400">
                          Dikirim pada: {new Date(reqItem.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {reqItem.status !== 'APPROVED' ? (
                        <Button
                          size="sm"
                          onClick={() => handleApproveB2b(reqItem.id)}
                          disabled={b2bApproving === reqItem.id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 text-xs rounded-xl"
                        >
                          {b2bApproving === reqItem.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          Setujui & Process Order
                        </Button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 text-center">
                          ✓ Pesanan Disetujui
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
