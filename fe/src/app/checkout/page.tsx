"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { QRCodeSVG } from "qrcode.react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2, Package, MapPin, Truck, CreditCard, Leaf, Plus, QrCode, Building, Copy } from "lucide-react";
import { safeFetchJson } from "@/lib/api";

const MapPicker = dynamic(() => import("@/components/map-picker"), { ssr: false });

interface Address {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  full_address: string;
  city_id?: string;
  province_id?: string;
  lat: number;
  lng: number;
  is_primary: boolean;
}

interface ShippingCost {
  service: string;
  description: string;
  cost: [{
    value: number;
    etd: string;
    note: string;
  }]
}


export default function CheckoutPage() {
  const { items, totalPrice, totalPointsUsed, totalFinalPrice, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Modal State
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrisData, setQrisData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"QRIS" | "TRANSFER">("QRIS");

  // RajaOngkir state
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [shippingOptions, setShippingOptions] = useState<ShippingCost[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<number>(0);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<string>("jne");
  
  const [districts, setDistricts] = useState<any[]>([]);
  const [villages, setVillages] = useState<any[]>([]);

  // Address Suggestions State
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // New Address Form State
  const [newAddress, setNewAddress] = useState({
    label: "",
    recipient: "",
    phone: "",
    full_address: "",
    province_id: "",
    city_id: "",
    district_id: "",
    village_id: "",
    lat: -6.200000,
    lng: 106.816666,
    is_primary: false
  });
  
  const [rtRw, setRtRw] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    setMounted(true);
    fetchAddresses();
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (selectedAddressId) {
      const addr = addresses.find(a => a.id === selectedAddressId);
      if (addr && addr.city_id) {
        fetchShippingCost(addr.city_id);
      }
    }
  }, [selectedAddressId, selectedCourier]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Suggestions when address is typed
  useEffect(() => {
    if (newAddress.full_address && newAddress.full_address.length > 3 && showSuggestions) {
      const fetchSuggestions = async () => {
        const selVil = villages.find(v => v.id === newAddress.village_id)?.name || "";
        const selDist = districts.find(d => d.id === newAddress.district_id)?.name || "";
        const selCity = cities.find(c => c.id === newAddress.city_id)?.name || "";
        
        const queryContext = [selVil, selDist, selCity].filter(Boolean).join(", ");
        const q = `${newAddress.full_address}${queryContext ? `, ${queryContext}` : ""}`;
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=id&limit=5`);
          const data = await res.json();
          setAddressSuggestions(data);
        } catch (err) {
          console.error(err);
        }
      };
      
      const timer = setTimeout(fetchSuggestions, 800);
      return () => clearTimeout(timer);
    }
  }, [newAddress.full_address, newAddress.village_id, newAddress.district_id, newAddress.city_id, showSuggestions]);

  const fetchProvinces = async () => {
    try {
      const res = await fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json");
      const data = await res.json();
      setProvinces(data);
    } catch (err) {
      console.error("Gagal mengambil data provinsi", err);
    }
  };

  const fetchCities = async (provinceId: string) => {
    try {
      const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`);
      const data = await res.json();
      setCities(data);
    } catch (err) {
      console.error("Gagal mengambil data kota", err);
    }
  };

  const fetchDistricts = async (cityId: string) => {
    try {
      const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${cityId}.json`);
      const data = await res.json();
      setDistricts(data);
    } catch (err) {
      console.error("Gagal mengambil data kecamatan", err);
    }
  };

  const fetchVillages = async (districtId: string) => {
    try {
      const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${districtId}.json`);
      const data = await res.json();
      setVillages(data);
    } catch (err) {
      console.error("Gagal mengambil data kelurahan", err);
    }
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setNewAddress({ ...newAddress, province_id: pId, city_id: "", district_id: "", village_id: "" });
    setCities([]);
    setDistricts([]);
    setVillages([]);
    if (pId) {
      fetchCities(pId);
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cId = e.target.value;
    setNewAddress({...newAddress, city_id: cId, district_id: "", village_id: ""});
    setDistricts([]);
    setVillages([]);
    if (cId) {
      fetchDistricts(cId);
      const generatedPostal = (parseInt(cId) * 7 % 89999 + 10000).toString();
      setPostalCode(generatedPostal);
    } else {
      setPostalCode("");
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dId = e.target.value;
    setNewAddress({...newAddress, district_id: dId, village_id: ""});
    setVillages([]);
    if (dId) {
      fetchVillages(dId);
    }
  };

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await fetch(`${API}/api/addresses/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await safeFetchJson(res);
      if (data.success) {
        setAddresses(data.data);
        const primary = data.data.find((a: Address) => a.is_primary);
        if (primary) setSelectedAddressId(primary.id);
        else if (data.data.length > 0) setSelectedAddressId(data.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAddresses(false);
    }
  };
  const fetchShippingCost = async (cityId: string) => {
    setLoadingShipping(true);
    setShippingOptions([]);
    setSelectedShipping(0);
    try {
      const token = localStorage.getItem("token");
      const totalWeight = items.reduce((acc, item) => acc + (item.quantity * 500), 0) || 1000;
      
      const res = await fetch(`${API}/api/shipping/cost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          destination: cityId,
          weight: totalWeight,
          courier: selectedCourier
        })
      });
      const data = await safeFetchJson(res);
      if (data.success && data.data.length > 0) {
        setShippingOptions(data.data[0].costs);
        if (data.data[0].costs.length > 0) {
          setSelectedShipping(data.data[0].costs[0].cost[0].value);
        }
      }
    } catch (err) {
      console.error("Gagal memuat ongkos kirim");
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      const selDist = districts.find(d => d.id === newAddress.district_id);
      const selVil = villages.find(v => v.id === newAddress.village_id);
      const ext = `${selVil ? `, Kel. ${selVil.name}` : ""}${selDist ? `, Kec. ${selDist.name}` : ""}`;
      const full_address_combined = `${newAddress.full_address}${ext}${rtRw ? `, RT/RW: ${rtRw}` : ""}${postalCode ? `, Kode Pos: ${postalCode}` : ""}`;
      const payload = { ...newAddress, full_address: full_address_combined };

      const res = await fetch(`${API}/api/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await safeFetchJson(res);
      if (data.success) {
        setShowAddAddress(false);
        fetchAddresses();
      } else {
        alert(data.message || "Gagal menyimpan alamat");
      }
    } catch (err) {
      alert("Error koneksi");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!selectedAddressId) {
      alert("Silakan pilih alamat pengiriman terlebih dahulu.");
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          points_used: item.points_used
        })),
        shipping_address_id: selectedAddressId,
        shipping_cost: selectedShipping,
        courier: selectedCourier.toUpperCase()
      };

      const res = await fetch(`${API}/api/orders/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await safeFetchJson(res);
      if (data.success) {
        if (data.data.qris) {
          // Show QRISly Modal
          setQrisData(data.data.qris);
          setShowQRModal(true);
        } else {
          // Free order
          clearCart();
          router.push("/checkout/success");
        }
      } else {
        alert(data.message || "Gagal checkout");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi saat checkout");
    } finally {
      setLoading(false);
    }
  };

  const simulatePaymentSuccess = () => {
    setShowQRModal(false);
    clearCart();
    router.push("/checkout/success");
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <Package className="w-24 h-24 text-slate-300 dark:text-slate-700 mb-6" />
        <h2 className="text-2xl font-bold mb-2 text-foreground">Keranjang Masih Kosong</h2>
        <Link href="/marketplace">
          <Button size="lg" className="rounded-full shadow-md mt-4">Kembali ke Katalog Produk</Button>
        </Link>
      </div>
    );
  }

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 lg:py-12 relative">
        


        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/marketplace">
              <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border"><ArrowLeft className="w-5 h-5" /></Button>
            </Link>
            <div>
              <h1 className="text-2xl font-black text-foreground">Checkout</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 lg:p-8 border shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-3"><MapPin className="text-blue-500" /> Alamat Pengiriman</h2>
                  <Button variant="outline" size="sm" onClick={() => setShowAddAddress(true)} className="rounded-full"><Plus className="w-4 h-4 mr-1" /> Tambah Baru</Button>
                </div>
                
                {loadingAddresses ? (
                  <div className="text-center py-8 animate-pulse">Memuat alamat...</div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed rounded-xl"><p>Belum ada alamat tersimpan</p></div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((addr) => (
                      <label key={addr.id} className={`block cursor-pointer rounded-xl border-2 p-4 transition-all ${selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'hover:border-primary/30'}`}>
                        <div className="flex items-start gap-3">
                          <input type="radio" name="address" value={addr.id} checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} className="mt-1" />
                          <div className="flex-1">
                            <p className="font-bold">{addr.recipient} | {addr.phone}</p>
                            <p className="text-sm font-medium">{addr.label}</p>
                            <p className="text-sm">{addr.full_address}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Courier / RajaOngkir Options */}
              <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 lg:p-8 border shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-3"><Truck className="text-amber-500" /> Opsi Pengiriman</h2>
                  <select 
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                    value={selectedCourier}
                    onChange={(e) => setSelectedCourier(e.target.value)}
                  >
                    <option value="jne">JNE</option>
                    <option value="pos">POS Indonesia</option>
                    <option value="tiki">TIKI</option>
                    <option value="sicepat">SiCepat</option>
                  </select>
                </div>
                {loadingShipping ? (
                  <div className="text-center py-8 animate-pulse">Mengecek ongkos kirim RajaOngkir...</div>
                ) : shippingOptions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Pilih alamat tujuan untuk melihat ongkos kirim.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {shippingOptions.map((opt, i) => (
                      <label key={i} className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${selectedShipping === opt.cost[0].value ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <input type="radio" name="courier" value={opt.cost[0].value} checked={selectedShipping === opt.cost[0].value} onChange={() => setSelectedShipping(opt.cost[0].value)} />
                            <span className="font-bold">{opt.service} - {opt.description}</span>
                          </div>
                          <span className="font-semibold">{formatRupiah(opt.cost[0].value)}</span>
                        </div>
                        <p className="text-xs pl-6 text-muted-foreground">Estimasi: {opt.cost[0].etd} hari</p>
                      </label>
                    ))}
                  </div>
                )}
              </div>

            </div>

            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-900 rounded-[24px] border shadow-xl sticky top-8">
                <div className="p-6 border-b"><h3 className="font-bold text-lg flex items-center gap-2"><CreditCard className="text-primary" /> Ringkasan Pesanan</h3></div>
                <div className="p-6 space-y-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span>Subtotal Produk</span><span className="font-medium">{formatRupiah(totalPrice)}</span></div>
                    <div className="flex justify-between text-primary"><span>Diskon Poin</span><span>-{formatRupiah(totalPointsUsed)}</span></div>
                    <div className="flex justify-between"><span>Ongkos Kirim (RajaOngkir)</span><span className="font-medium">{formatRupiah(selectedShipping)}</span></div>
                  </div>
                  <div className="h-px bg-slate-200 dark:bg-slate-800"></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium mb-1">Total Pembayaran</span>
                    <span className="text-3xl font-black">{formatRupiah(totalFinalPrice + selectedShipping)}</span>
                  </div>
                  <Button onClick={handleCheckout} disabled={loading || !selectedAddressId || selectedShipping === 0} className="w-full h-14 rounded-xl text-lg font-bold shadow-xl">
                    {loading ? "Memproses..." : "Bayar Sekarang"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Payment */}
      {showQRModal && qrisData && (
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
                      value={qrisData.qr_string} 
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
                {formatRupiah(totalFinalPrice + selectedShipping)}
              </h3>
              
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-lg font-medium mb-4">
                Batas waktu: {new Date(qrisData.expires_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
              </p>

              <Button onClick={simulatePaymentSuccess} className="w-full rounded-xl">
                Simulasikan Bayar Berhasil
              </Button>
              <Button variant="ghost" onClick={() => setShowQRModal(false)} className="w-full mt-2 text-muted-foreground">
                Tutup & Batalkan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Alamat */}
      {showAddAddress && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-950 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-8">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Tambah Alamat Baru
              </h2>
              <button onClick={() => setShowAddAddress(false)} className="text-muted-foreground hover:text-foreground">Tutup</button>
            </div>
            <form onSubmit={handleSaveAddress} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Label Alamat (cth: Rumah)</Label>
                  <Input required value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} placeholder="Rumah" />
                </div>
                <div className="space-y-2">
                  <Label>Nama Penerima</Label>
                  <Input required value={newAddress.recipient} onChange={e => setNewAddress({...newAddress, recipient: e.target.value})} placeholder="Budi Santoso" />
                </div>
              </div>
              


              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Provinsi</Label>
                  <select 
                    required 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={newAddress.province_id}
                    onChange={handleProvinceChange}
                  >
                    <option value="">Pilih Provinsi</option>
                    {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Kota/Kabupaten</Label>
                  <select 
                    required 
                    disabled={!newAddress.province_id}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={newAddress.city_id}
                    onChange={handleCityChange}
                  >
                    <option value="">Pilih Kota</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kecamatan</Label>
                  <select 
                    required 
                    disabled={!newAddress.city_id}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={newAddress.district_id}
                    onChange={handleDistrictChange}
                  >
                    <option value="">Pilih Kecamatan</option>
                    {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Kelurahan / Desa</Label>
                  <select 
                    required 
                    disabled={!newAddress.district_id}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={newAddress.village_id}
                    onChange={e => setNewAddress({...newAddress, village_id: e.target.value})}
                  >
                    <option value="">Pilih Kelurahan</option>
                    {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nomor HP</Label>
                <Input required value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} />
              </div>
              <div className="space-y-2 relative" ref={suggestionRef}>
                <Label>Alamat Lengkap</Label>
                <textarea 
                  required rows={3} value={newAddress.full_address}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={e => {
                    setNewAddress({...newAddress, full_address: e.target.value});
                    setShowSuggestions(true);
                  }}
                  placeholder="Nama jalan, gedung, no rumah..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                
                {showSuggestions && addressSuggestions.length > 0 && (
                  <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg overflow-hidden">
                    {addressSuggestions.map((sugg, i) => (
                      <div 
                        key={i} 
                        className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b last:border-0 border-slate-100 dark:border-slate-800 text-sm transition-colors"
                        onClick={() => {
                          setNewAddress({
                            ...newAddress, 
                            full_address: sugg.display_name.split(",")[0], // Just use the first part of the suggestion for the street
                            lat: parseFloat(sugg.lat),
                            lng: parseFloat(sugg.lon)
                          });
                          setShowSuggestions(false);
                        }}
                      >
                        <div className="font-semibold text-primary">{sugg.display_name.split(",")[0]}</div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{sugg.display_name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>RT / RW</Label>
                  <Input value={rtRw} onChange={e => setRtRw(e.target.value)} placeholder="001/002" />
                </div>
                <div className="space-y-2">
                  <Label>Kode Pos</Label>
                  <Input type="number" value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="12345" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tandai Lokasi di Peta</Label>
                <div className="p-1 border rounded-xl bg-slate-50">
                  <MapPicker 
                    lat={newAddress.lat}
                    lng={newAddress.lng}
                    searchQuery={[
                      newAddress.full_address, 
                      villages.find(v => v.id === newAddress.village_id)?.name,
                      districts.find(d => d.id === newAddress.district_id)?.name,
                      cities.find(c => c.id === newAddress.city_id)?.name, 
                      provinces.find(p => p.id === newAddress.province_id)?.name
                    ].filter(Boolean).join(", ")}
                    onLocationSelect={(lat, lng) => setNewAddress({...newAddress, lat, lng})} 
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="is_primary" checked={newAddress.is_primary} onChange={e => setNewAddress({...newAddress, is_primary: e.target.checked})} className="w-4 h-4" />
                <Label htmlFor="is_primary">Jadikan Alamat Utama</Label>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowAddAddress(false)}>Batal</Button>
                <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
