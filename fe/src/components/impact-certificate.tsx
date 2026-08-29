"use client";

import { Leaf, Award, Scale, TreePine, Droplets, Share2, X, Check, ShieldCheck, Sparkles, Medal, Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface ImpactCertificateProps {
  userName: string;
  totalPoints: number;
  totalTransactions: number;
  totalWeightKg?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImpactCertificate({
  userName,
  totalPoints,
  totalTransactions,
  totalWeightKg,
  isOpen,
  onClose,
}: ImpactCertificateProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Calculated stats based on actual user transactions/points
  const estWeightKg = totalWeightKg && totalWeightKg > 0
    ? Math.round(totalWeightKg * 10) / 10
    : Math.max(0.5, Math.round(totalTransactions * 2.5 * 10) / 10);
  const estCarbonSaved = Math.max(0.6, Math.round(estWeightKg * 1.2 * 10) / 10);
  const estPlasticSaved = Math.max(0.4, Math.round(estWeightKg * 0.8 * 10) / 10);

  const certNumber = `ECO-2026-${Math.abs(userName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) * 37) % 90000 + 10000}`;

  const shareText = `🌱 SERTIFIKAT KONTRIBUSI ECO HUB\n\nNama: ${userName}\nTotal Poin: ${totalPoints.toLocaleString()} pts\nSampah Didaur Ulang: ${estWeightKg} kg\nCO₂ Dihemat: -${estCarbonSaved} kg\n\nNomor Sertifikat: ${certNumber}\nTerverifikasi di Eco Hub (ITechno Cup 2026)`;

  const handleShareSocial = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Sertifikat Kontribusi Eco Hub",
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch {}
    }
    // Fallback to WhatsApp Web link
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, "_blank");
  };

  const handleCopyText = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadPDF = () => {
    // Construct printable SVG certificate for high-res PDF export
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700" viewBox="0 0 1000 700">
        <rect width="1000" height="700" fill="#020617"/>
        <rect x="30" y="30" width="940" height="640" rx="30" fill="none" stroke="#f59e0b" stroke-width="4" opacity="0.6"/>
        <rect x="45" y="45" width="910" height="610" rx="20" fill="none" stroke="#10b981" stroke-width="2" opacity="0.3"/>
        
        <!-- Header -->
        <text x="500" y="95" font-family="sans-serif" font-size="18" font-weight="bold" fill="#f59e0b" text-anchor="middle" letter-spacing="4">ECO HUB PLATFORM · ITECHNO CUP 2026</text>
        <text x="500" y="145" font-family="sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle">SERTIFIKAT KONTRIBUSI LINGKUNGAN</text>
        <text x="500" y="180" font-family="sans-serif" font-size="13" fill="#94a3b8" text-anchor="middle">NOMOR REGISTRASI: ${certNumber}</text>
        
        <!-- Recipient -->
        <text x="500" y="235" font-family="sans-serif" font-size="15" fill="#cbd5e1" text-anchor="middle">Diberikan secara sah kepada Pahlawan Lingkungan:</text>
        <text x="500" y="290" font-family="sans-serif" font-size="40" font-weight="900" fill="#34d399" text-anchor="middle">${userName}</text>
        <text x="500" y="330" font-family="sans-serif" font-size="13" fill="#64748b" text-anchor="middle">Atas kontribusi nyata dalam mewujudkan Ekonomi Sirkular Berkelanjutan</text>
        
        <!-- Metrics Cards -->
        <rect x="100" y="360" width="180" height="95" rx="16" fill="#0f172a" stroke="#f59e0b" stroke-opacity="0.3"/>
        <text x="190" y="402" font-family="sans-serif" font-size="24" font-weight="900" fill="#f59e0b" text-anchor="middle">${totalPoints.toLocaleString()}</text>
        <text x="190" y="430" font-family="sans-serif" font-size="11" fill="#94a3b8" text-anchor="middle">Total Eco-Points</text>
        
        <rect x="300" y="360" width="180" height="95" rx="16" fill="#0f172a" stroke="#10b981" stroke-opacity="0.3"/>
        <text x="390" y="402" font-family="sans-serif" font-size="24" font-weight="900" fill="#34d399" text-anchor="middle">${estWeightKg} kg</text>
        <text x="390" y="430" font-family="sans-serif" font-size="11" fill="#94a3b8" text-anchor="middle">Sampah Didaur Ulang</text>
        
        <rect x="500" y="360" width="180" height="95" rx="16" fill="#0f172a" stroke="#14b8a6" stroke-opacity="0.3"/>
        <text x="590" y="402" font-family="sans-serif" font-size="24" font-weight="900" fill="#2dd4bf" text-anchor="middle">-${estCarbonSaved} kg</text>
        <text x="590" y="430" font-family="sans-serif" font-size="11" fill="#94a3b8" text-anchor="middle">Penghematan CO₂</text>

        <rect x="700" y="360" width="180" height="95" rx="16" fill="#0f172a" stroke="#38bdf8" stroke-opacity="0.3"/>
        <text x="790" y="402" font-family="sans-serif" font-size="24" font-weight="900" fill="#38bdf8" text-anchor="middle">-${estPlasticSaved} kg</text>
        <text x="790" y="430" font-family="sans-serif" font-size="11" fill="#94a3b8" text-anchor="middle">Plastik Dihemat</text>

        <!-- Official Signature & Verification Stamp Block -->
        <!-- Cap Stempel Basah -->
        <circle cx="790" cy="535" r="45" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="4 2" opacity="0.8"/>
        <circle cx="790" cy="535" r="38" fill="none" stroke="#10b981" stroke-width="1" opacity="0.6"/>
        <text x="790" y="525" font-family="sans-serif" font-size="9" font-weight="bold" fill="#10b981" text-anchor="middle">★ ECO HUB ★</text>
        <text x="790" y="540" font-family="sans-serif" font-size="10" font-weight="bold" fill="#34d399" text-anchor="middle">TERVERIFIKASI</text>
        <text x="790" y="552" font-family="sans-serif" font-size="8" fill="#10b981" text-anchor="middle">POS RW 05 DIGITAL</text>

        <!-- Cursive Signature -->
        <path d="M 680 520 Q 710 480 730 520 T 780 500 T 820 525" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" />
        <text x="750" y="580" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">Ricki Gilang Saputra, S.T.</text>
        <text x="750" y="600" font-family="sans-serif" font-size="11" fill="#94a3b8" text-anchor="middle">Ketua Program Ekonomi Sirkular Eco Hub</text>

        <!-- QR Code Verification Stamp Left -->
        <rect x="100" y="490" width="100" height="100" rx="12" fill="#ffffff"/>
        <path d="M110 500 h20 v20 h-20 z M140 500 h10 v10 h-10 z M160 500 h30 v30 h-30 z M110 530 h10 v20 h-10 z M130 530 h20 v10 h-20 z M160 540 h20 v10 h-20 z M110 560 h30 v30 h-30 z M150 560 h40 v30 h-40 z" fill="#020617"/>
        <text x="100" y="615" font-family="sans-serif" font-size="10" font-weight="bold" fill="#34d399">SCAN VERIFIKASI KEASLIAN</text>

        <!-- Footer Bar -->
        <text x="500" y="650" font-family="sans-serif" font-size="11" fill="#475569" text-anchor="middle">Diterbitkan secara sah oleh Platform Terintegrasi Eco Hub · ITechno Cup 2026</text>
      </svg>
    `;

    // Open print / save window formatted as PDF landscape
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Sertifikat_${userName.replace(/\s+/g, "_")}_EcoHub</title>
            <style>
              @page { size: A4 landscape; margin: 0; }
              body { margin: 0; background: #020617; display: flex; items-center: center; justify-content: center; min-height: 100vh; }
              img { width: 100%; max-width: 1100px; height: auto; display: block; }
            </style>
          </head>
          <body>
            <img src="${url}" onload="window.print();" />
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      {/* Outer Certificate Box */}
      <div
        className="relative max-w-lg w-full bg-slate-950 text-white rounded-[2.5rem] border-2 border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.2)] p-1 overflow-hidden transition-all duration-300 transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Inner Gold Ornate Border Container */}
        <div className="relative rounded-[2.3rem] border border-amber-500/20 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-8 space-y-6 overflow-hidden">
          {/* Background Ambient Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-40 bg-gradient-to-b from-amber-500/20 via-emerald-500/10 to-transparent blur-3xl -z-10" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -z-10" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Official Emblem & Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 p-0.5 shadow-lg shadow-amber-500/20 mx-auto">
              <div className="w-full h-full bg-slate-950 rounded-[0.85rem] flex items-center justify-center">
                <Medal className="h-7 w-7 text-amber-400" />
              </div>
            </div>

            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold uppercase tracking-widest">
                <Sparkles className="h-3 w-3" /> Sertifikat Resmi Kontribusi
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 tracking-tight">
              PAHLAWAN LINGKUNGAN
            </h2>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">
              NO: {certNumber}
            </p>
          </div>

          {/* Recipient Ribbon */}
          <div className="bg-gradient-to-r from-transparent via-amber-500/10 to-transparent py-4 text-center border-y border-amber-500/20">
            <p className="text-xs text-slate-400 font-medium">Sertifikat ini secara sah diberikan kepada:</p>
            <p className="text-2xl sm:text-3xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-white to-emerald-300 mt-1">
              {userName}
            </p>
            <p className="text-[11px] text-emerald-400/90 font-medium mt-1">
              Atas partisipasi aktif dalam gerakan Ekonomi Sirkular Berkelanjutan
            </p>
          </div>

          {/* Impact Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-slate-900 to-slate-900/80 border border-amber-500/20 rounded-2xl p-3.5 text-center shadow-inner">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-2">
                <Award className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-xl font-black text-amber-400">{totalPoints.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 font-medium">Eco-Points Perolehan</p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-900/80 border border-emerald-500/20 rounded-2xl p-3.5 text-center shadow-inner">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2">
                <Scale className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-xl font-black text-emerald-400">{estWeightKg} kg</p>
              <p className="text-[10px] text-slate-400 font-medium">Sampah Didaur Ulang</p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-900/80 border border-teal-500/20 rounded-2xl p-3.5 text-center shadow-inner">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto mb-2">
                <TreePine className="h-4 w-4 text-teal-400" />
              </div>
              <p className="text-xl font-black text-teal-400">-{estCarbonSaved} kg</p>
              <p className="text-[10px] text-slate-400 font-medium">Penghematan CO₂</p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-900/80 border border-sky-500/20 rounded-2xl p-3.5 text-center shadow-inner">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto mb-2">
                <Droplets className="h-4 w-4 text-sky-400" />
              </div>
              <p className="text-xl font-black text-sky-400">-{estPlasticSaved} kg</p>
              <p className="text-[10px] text-slate-400 font-medium">Plastik Dihemat</p>
            </div>
          </div>

          {/* Signature & Barcode Verification Block */}
          <div className="pt-3 border-t border-amber-500/20 grid grid-cols-2 items-center gap-3">
            {/* QR Barcode Verification */}
            <div className="flex items-center gap-2.5">
              <div className="p-1 bg-white rounded-xl shadow-md border border-slate-200">
                <QRCodeSVG value={`https://ecohub.id/verify/${certNumber}`} size={52} fgColor="#020617" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> QR Terverifikasi
                </p>
                <p className="text-[9px] text-slate-400 leading-tight">Scan keaslian dokumen</p>
              </div>
            </div>

            {/* Official Signature & Cap Stempel */}
            <div className="relative text-right flex flex-col items-end">
              {/* Cap Stempel Basah */}
              <div className="absolute -top-3 right-6 w-14 h-14 border border-emerald-500/50 rounded-full flex items-center justify-center rotate-[-15deg] pointer-events-none opacity-70 bg-emerald-500/5">
                <span className="text-[7px] font-black text-emerald-400 uppercase text-center leading-tight">
                  POS RW 05<br/>★ TERVERIFIKASI ★<br/>ECOHUB
                </span>
              </div>
              
              {/* Signature Graphic */}
              <svg className="w-24 h-7 text-amber-400" viewBox="0 0 120 40">
                <path d="M 10 30 Q 35 5 50 30 T 90 20 T 110 30" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </svg>

              <p className="text-xs font-bold text-white leading-none">Ricki Gilang Saputra, S.T.</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Ketua Program Ekonomi Sirkular</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <Button
              onClick={handleDownloadPDF}
              className="flex-1 font-bold gap-2 h-11 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/20"
            >
              <Download className="h-4 w-4" /> Unduh Sertifikat (PDF)
            </Button>
            <Button
              onClick={handleShareSocial}
              className="flex-1 font-bold gap-2 h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
            >
              <Share2 className="h-4 w-4" /> Bagikan Medsos
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImpactCertificate;

