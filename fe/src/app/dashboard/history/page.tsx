"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, ArrowLeft, Recycle, ChevronLeft, ChevronRight, Filter, Calendar, Scale, Award, User, Camera, X, Image as ImageIcon, MapPin, Package, QrCode, Building, Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
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
  const [orders, setOrders] = useState<any[]>([]);

  const [stats, setStats] = useState<MonthlyStats>({
    totalPoints: 0,
    totalWeight: 0,
    totalTransactions: 0,
  });
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState("WASTE"); // "WASTE" | "ORDERS"

  // Modal State
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedOrderToPay, setSelectedOrderToPay] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"QRIS" | "TRANSFER">("QRIS");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("tab") === "orders") {
        setActiveTab("ORDERS");
      }
    }
  }, []);

  const handlePayOrderClick = (order: any) => {
    setSelectedOrderToPay(order);
    setShowQRModal(true);
  };

  const executePayOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API}/api/orders/${orderId}/pay`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await safeFetchJson(res);
      if (data.success) {
        alert("Pembayaran berhasil disimulasikan!");
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: "PAID" } : o));
        setShowQRModal(false);
        setSelectedOrderToPay(null);
      } else {
        alert(data.message || "Gagal melakukan pembayaran");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API}/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await safeFetchJson(res);
      if (data.success) {
        alert("Pesanan dibatalkan. Poin dikembalikan.");
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: "CANCELLED" } : o));
      } else {
        alert(data.message || "Gagal membatalkan pesanan");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan");
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API}/api/orders/${orderId}/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await safeFetchJson(res);
      if (data.success) {
        alert("Pesanan selesai! Terima kasih.");
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: "COMPLETED" } : o));
      } else {
        alert(data.message || "Gagal menyelesaikan pesanan");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan");
    }
  };

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

        // Fetch data based on active tab
        if (activeTab === "WASTE") {
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
        } else if (activeTab === "ORDERS") {
          let url = `${API}/api/orders/my?page=${page}&limit=10`;
          const orderRes = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null);
          
          if (orderRes && orderRes.ok) {
            const orderData = await safeFetchJson(orderRes);
            if (orderData.success) {
              setOrders(orderData.data.orders || []);
              setTotalPages(orderData.data.pagination?.totalPages || 1);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching history data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, statusFilter, activeTab, router]);

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

  const filteredOrders = orders.filter(o => orderStatusFilter === "ALL" || o.status === orderStatusFilter);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-inter">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-card border-b border-slate-200 dark:border-slate-800">
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

        {/* Main Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
          <button 
            className={`pb-3 px-6 font-semibold text-sm border-b-2 transition-colors ${activeTab === "WASTE" ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            onClick={() => { setActiveTab("WASTE"); setPage(1); }}
          >
            Setoran Sampah
          </button>
          <button 
            className={`pb-3 px-6 font-semibold text-sm border-b-2 transition-colors ${activeTab === "ORDERS" ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            onClick={() => { setActiveTab("ORDERS"); setPage(1); }}
          >
            Riwayat Pembelian
          </button>
        </div>

        {/* Filters (Only for Waste Tab) */}
        {activeTab === "WASTE" && (
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 animate-in fade-in">
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
        )}

        {/* Filters (Only for Orders Tab) */}
        {activeTab === "ORDERS" && (
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 animate-in fade-in">
            <h2 className="font-heading font-semibold text-xl text-foreground dark:text-foreground w-full sm:w-auto">
              Riwayat Pesanan
            </h2>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {["ALL", "PENDING", "PAID", "COMPLETED", "CANCELLED"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setOrderStatusFilter(status);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  orderStatusFilter === status
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 text-foreground dark:text-foreground hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {status === "ALL" ? "Semua" : status === "PENDING" ? "Menunggu Bayar" : status === "PAID" ? "Dikemas" : status === "COMPLETED" ? "Selesai" : "Batal"}
              </button>
            ))}
          </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : activeTab === "WASTE" ? (
          transactions.length > 0 ? (
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

              {/* Pagination for Waste Tab */}
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
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in">
              <div className="mx-auto w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Recycle className="h-10 w-10 text-foreground" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-foreground  mb-2">
                Belum ada setoran
              </h3>
              <p className="text-foreground dark:text-foreground max-w-md mx-auto">
                Anda belum memiliki riwayat setoran sampah{statusFilter !== "ALL" && " untuk status ini"}. 
                Mulai setorkan sampah Anda untuk mengumpulkan poin!
              </p>
            </div>
          )
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4 animate-in fade-in">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow"
              >
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 relative">
                  <img src={getFullImageUrl(order.product?.image_url) || "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80"} alt={order.product?.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                    <div>
                      <h3 className="font-heading font-semibold text-lg text-foreground">{order.product?.name || "Produk Dihapus"}</h3>
                      <div className="flex items-center text-sm text-muted-foreground gap-4 mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.created_at)}
                        </div>
                        <span>Qty: {order.quantity}</span>
                      </div>
                    </div>
                    <StatusBadge status={order.status as any} />
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="font-bold text-lg text-foreground">
                      Rp {order.final_price_idr.toLocaleString("id-ID")}
                    </span>
                    {order.points_used > 0 && (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Award className="h-3.5 w-3.5" /> Diskon {order.points_used} Poin
                      </span>
                    )}
                  </div>
                  
                  {order.status === "PENDING" && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                      <Button onClick={() => handleCancelOrder(order.id)} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-full px-6">
                        Batalkan
                      </Button>
                      <Button onClick={() => handlePayOrderClick(order)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6">
                        Bayar Sekarang
                      </Button>
                    </div>
                  )}
                  {order.status === "PAID" && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <Button onClick={() => handleCompleteOrder(order.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6">
                        Pesanan Diterima
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination for Orders Tab */}
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
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in">
            <div className="mx-auto w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Package className="h-10 w-10 text-foreground" />
            </div>
            <h3 className="text-lg font-heading font-semibold text-foreground  mb-2">
              Belum ada pembelian
            </h3>
            <p className="text-foreground dark:text-foreground max-w-md mx-auto">
              Anda belum memiliki riwayat pembelian produk{orderStatusFilter !== "ALL" && " untuk status ini"}. 
              Gunakan poin daur ulang Anda untuk belanja!
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

      {/* Modal Payment */}
      {showQRModal && selectedOrderToPay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 text-center relative flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
              <h2 className="text-xl font-bold flex items-center justify-center gap-2">
                Selesaikan Pembayaran
              </h2>
              <div className="flex bg-slate-200/50 dark:bg-slate-800 p-1 rounded-xl mt-4">
                <button 
                  onClick={() => setPaymentMethod("QRIS")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${paymentMethod === "QRIS" ? "bg-white dark:bg-slate-700 shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <QrCode className="w-4 h-4" /> QRIS
                </button>
                <button 
                  onClick={() => setPaymentMethod("TRANSFER")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${paymentMethod === "TRANSFER" ? "bg-white dark:bg-slate-700 shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Building className="w-4 h-4" /> Transfer
                </button>
              </div>
            </div>
            
            <div className="p-8 flex flex-col items-center justify-center overflow-y-auto">
              {paymentMethod === "QRIS" ? (
                <>
                  <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-100 mb-4 inline-block">
                    <QRCodeSVG 
                      value={`00020101021126570011ID.CO.QRIS.WWW01189360091531234567890214ID12345678901235204581253033605405${selectedOrderToPay.final_price_idr}5802ID5913ECOHUB MARKET6007JAKARTA6105123456304CA20`}
                      size={180}
                      bgColor={"#ffffff"}
                      fgColor={"#000000"}
                      level={"Q"}
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Total yang harus dibayar:</p>
                </>
              ) : (
                <div className="w-full flex flex-col items-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                    <Building className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">BCA Virtual Account</p>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 w-full justify-between">
                    <span className="font-mono font-bold text-lg tracking-wider text-foreground">8077 1234 5678</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg" onClick={() => alert('Nomor VA disalin!')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-6 mb-1">Total yang harus dibayar:</p>
                </div>
              )}
              <h3 className="text-2xl font-black text-foreground mb-6">
                Rp {selectedOrderToPay.final_price_idr.toLocaleString("id-ID")}
              </h3>

              <Button onClick={() => executePayOrder(selectedOrderToPay.id)} className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                Simulasikan Bayar Berhasil
              </Button>
              <Button variant="ghost" onClick={() => { setShowQRModal(false); setSelectedOrderToPay(null); }} className="w-full mt-2 text-muted-foreground">
                Tutup & Bayar Nanti
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
