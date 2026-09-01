"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, ArrowLeft, Recycle, ChevronLeft, ChevronRight, Filter, Calendar, Scale, Award, User, Camera, X, Image as ImageIcon, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { safeFetchJson } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Transaction {
  id: string;
  weight: number;
  points_awarded: number;
  status: string;
  notes: string;
  photo_url: string;
  created_at: string;
  waste_category: {
    name: string;
    point_per_kg: number;
  };
  admin: {
    name: string;
  } | null;
}

interface MonthlyStats {
  totalPoints: number;
  totalWeight: number;
  totalTransactions: number;
}

export default function HistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<MonthlyStats>({
    totalPoints: 0,
    totalWeight: 0,
    totalTransactions: 0,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        // Fetch stats
        const statsRes = await fetch(`${API}/api/leaderboard/monthly-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null);

        if (statsRes && statsRes.ok) {
          const statsData = await safeFetchJson(statsRes);
          if (statsData.success) {
            setStats({
              totalPoints: statsData.data.monthly_points || 0,
              totalWeight: statsData.data.monthly_weight_kg || 0,
              totalTransactions: statsData.data.monthly_transactions || 0,
            });
          }
        }

        // Fetch transactions
        let url = `${API}/api/transactions/my?page=${page}&limit=10`;
        if (statusFilter !== "ALL") {
          url += `&status=${statusFilter}`;
        }
        
        const transRes = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null);
        
        if (transRes && transRes.ok) {
          const transData = await safeFetchJson(transRes);
          if (transData.success) {
            setTransactions(transData.data.transactions || []);
            setTotalPages(transData.data.pagination?.totalPages || 1);
          }
        }
      } catch (error) {
        console.error("Error fetching history data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, statusFilter, router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFullImageUrl = (url: string | null) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API}${url.startsWith("/") ? url : `/${url}`}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-inter">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-card   border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <Leaf className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="font-heading font-bold text-xl text-foreground ">
                Riwayat Transaksi
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-foreground dark:text-foreground">Poin Bulan Ini</p>
                <p className="font-heading font-bold text-2xl text-foreground ">
                  {stats.totalPoints.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Scale className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-foreground dark:text-foreground">Berat Bulan Ini</p>
                <p className="font-heading font-bold text-2xl text-foreground ">
                  {stats.totalWeight.toFixed(1)} <span className="text-base font-normal">kg</span>
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center text-sky-600 dark:text-sky-400">
                <Recycle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-foreground dark:text-foreground">Total Transaksi</p>
                <p className="font-heading font-bold text-2xl text-foreground ">
                  {stats.totalTransactions}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <h2 className="font-heading font-semibold text-xl text-foreground dark:text-foreground w-full sm:w-auto">
            Daftar Setoran
          </h2>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {["ALL", "VALIDATED", "PENDING"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  statusFilter === status
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 text-foreground dark:text-foreground hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {status === "ALL" ? "Semua" : status === "VALIDATED" ? "Divalidasi" : "Menunggu"}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  {/* Left Section: Icon & Main Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center shrink-0">
                      <Recycle className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-lg text-foreground  mb-1">
                        {transaction.waste_category?.name || "Kategori Dihapus"}
                      </h3>
                      <div className="flex items-center text-sm text-foreground dark:text-foreground gap-4 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(transaction.created_at)}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium text-foreground dark:text-foreground">
                          <Scale className="h-4 w-4 text-emerald-500" />
                          {transaction.weight} kg
                        </div>
                        {transaction.status === "VALIDATED" && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-sm font-bold text-amber-600 dark:text-amber-400">
                            <Award className="h-4 w-4" />
                            +{transaction.points_awarded} poin
                          </div>
                        )}
                        <StatusBadge status={transaction.status as any} />
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Admin, Notes, Photo */}
                  <div className="flex flex-col items-start md:items-end gap-3 md:w-64 shrink-0">
                    {transaction.admin && (
                      <div className="flex items-center gap-2 text-sm text-foreground dark:text-foreground w-full justify-start md:justify-end bg-slate-50  px-3 py-2 rounded-xl">
                        <User className="h-4 w-4 text-foreground" />
                        <span className="truncate">Admin: {transaction.admin.name}</span>
                      </div>
                    )}
                    
                    {transaction.notes && (
                      <div className="text-sm text-foreground dark:text-foreground w-full text-left md:text-right italic bg-slate-50  px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
                        "{transaction.notes}"
                      </div>
                    )}
                    
                    {transaction.photo_url && (
                      <button
                        onClick={() => setSelectedImage(getFullImageUrl(transaction.photo_url))}
                        className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 w-full md:w-24 h-24 md:h-20 bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-all hover:ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900"
                      >
                        <img 
                          src={getFullImageUrl(transaction.photo_url)} 
                          alt="Foto sampah" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="text-white h-6 w-6" />
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-full"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="text-sm font-medium text-foreground dark:text-foreground">
                  Halaman {page} dari {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-full"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="mx-auto w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Recycle className="h-10 w-10 text-foreground" />
            </div>
            <h3 className="text-lg font-heading font-semibold text-foreground  mb-2">
              Belum ada transaksi
            </h3>
            <p className="text-foreground dark:text-foreground max-w-md mx-auto">
              Anda belum memiliki riwayat setoran sampah{statusFilter !== "ALL" && " untuk status ini"}. 
              Mulai setorkan sampah Anda untuk mengumpulkan poin!
            </p>
          </div>
        )}
      </main>

      {/* Photo Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80  flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 p-2 bg-card hover:bg-card text-foreground rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative w-full overflow-hidden rounded-lg bg-black/50 ring-1 ring-white/20">
              <img
                src={selectedImage}
                alt="Foto sampah ukuran penuh"
                className="w-full h-auto max-h-[85vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
