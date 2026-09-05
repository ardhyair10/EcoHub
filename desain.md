# Dokumen Desain UI/UX: Eco Hub

## 1. Filosofi Desain & Estetika
Eco Hub mengusung desain yang **Modern, Bersih (Clean), Terpercaya (Trustworthy), dan Ramah Lingkungan (Eco-friendly)**. Desain harus memukau (WOW factor) untuk standar kompetisi, menggunakan prinsip *glassmorphism* secara halus, *dark mode* support, dan animasi mikro yang dinamis untuk meningkatkan interaksi pengguna.

*   **Premium & Enterprise-Grade**: Menghindari tampilan yang terlalu kaku atau *basic*. UI akan terasa seperti aplikasi *startup* modern tingkat atas.
*   **Responsif**: Harus optimal baik di perangkat *mobile* (prioritas karena warga/admin memindai QR code via HP) maupun *desktop*.

## 2. Sistem Warna (Color Palette)
Warna utama akan didasarkan pada spektrum alam (hijau dan biru bumi) namun dengan sentuhan modern/neon untuk memberikan kesan teknologi yang maju (Smart Eco).

*   **Primary (Warna Utama)**: `Emerald Green` (`#10b981`) - Melambangkan lingkungan, daur ulang, dan poin (keuntungan).
*   **Secondary (Warna Sekunder)**: `Ocean Blue` (`#0ea5e9`) - Melambangkan teknologi, air, dan inovasi.
*   **Accent (Warna Aksen)**: `Amber/Gold` (`#f59e0b`) - Digunakan untuk Eco-Points, *badges*, dan elemen *reward/gamification*.
*   **Background (Terang/Light Mode)**: `Off-white` / `Soft Slate` (`#f8fafc`) - Bersih, tidak menyilaukan mata.
*   **Background (Gelap/Dark Mode)**: `Deep Slate` (`#0f172a`) - Elegan, *sleek*, dengan kartu/kontainer menggunakan efek *glassmorphism* (semi-transparan dengan *blur*).
*   **Text/Typography**: `Slate 900` (`#0f172a`) untuk terang, `Slate 50` (`#f8fafc`) untuk gelap.

## 3. Tipografi
Menggunakan *font* modern dari Google Fonts yang bersih dan memiliki keterbacaan tinggi di berbagai perangkat:
*   **Heading & Titles**: **`Outfit`** atau **`Clash Display`** - Memberikan kesan dinamis, tebal, dan modern.
*   **Body Text & UI Elements**: **`Inter`** - Standar industri untuk UI yang bersih, terbaca dengan jelas untuk data/angka (poin, berat sampah, harga).

## 4. UI Components & Design System (via Shadcn UI & TailwindCSS)
*   **Buttons**: Memiliki sudut agak membulat (`rounded-xl` atau `rounded-2xl`). *Hover effect* berupa bayangan lembut (*soft shadow*) dan sedikit terangkat (*translate-y*). Tombol utama menggunakan gradien (*Primary to Secondary*).
*   **Cards**: Untuk dasbor, produk, dan *event*. Menggunakan *border* tipis (`border-slate-200` di terang, `border-slate-800` di gelap) dengan *soft shadow* atau *glassmorphism* (`backdrop-blur`).
*   **Inputs/Forms**: Desain minimalis dengan label di atas (*floating label* opsional). Menggunakan *focus ring* berwarna `Primary` saat aktif.
*   **Badges**: *Pill-shaped* (`rounded-full`) untuk status (Pending/Completed, Kategori Sampah, Eco-Badge).
*   **Modals/Dialogs**: Transisi muncul perlahan dari bawah atau *fade-in*. Latar belakang di-*blur* saat modal aktif.

## 5. Rincian Layout Halaman (User Flows)

### A. Dashboard Warga (Citizen)
*   **Hero/Header Section**: Menampilkan sapaan ("Halo, [Nama]!"), total **Eco-Points** dengan teks besar dan warna aksen emas, serta tombol aksi cepat (CTA) "Tampilkan QR Saya".
*   **QR Code Modal**: Modal *pop-up* yang bersih dan besar di tengah layar dengan efek *glowing* halus, menonjolkan QR agar mudah dipindai oleh Admin.
*   **Stats/Leaderboard Widget**: Kartu kecil menampilkan peringkat RW atau total sampah yang telah dikontribusikan (gamifikasi).
*   **Recent Transactions**: Daftar/list vertikal dengan ikon kategori sampah (Plastik, Kardus, dll), berat, dan poin yang didapat.

### B. Dashboard Admin RW
*   **Scanner View (Utama)**: Tampilan *viewfinder* kamera penuh atau memakan sebagian besar layar atas untuk *scanning* QR Warga.
*   **Data Input Form**: Setelah QR terpindai, muncul *slide-up panel* untuk menginput berat sampah (`weight_kg`) dan memilih kategori (`waste_category_id`). Terdapat kalkulasi poin otomatis secara *real-time* di layar sebelum tombol *Submit* ditekan.
*   **Transaction History**: Tabel atau *list* transaksi hari ini.

### C. Halaman Eco-Commerce (Marketplace)
*   **Product Grid**: Tata letak *grid* responsif (2 kolom di *mobile*, 4 kolom di *desktop*).
*   **Product Card**: Gambar produk besar (menggunakan Cloudinary dengan radius sudut membulat), nama produk, harga (Rp), maksimal poin yang bisa dipakai. *Eco-Badge* ("Menghemat 2kg plastik") diletakkan menumpuk (*overlay*) di atas sudut gambar.
*   **Checkout Modal**: Menampilkan rincian pesanan. Terdapat **Slider interaktif** untuk menentukan berapa banyak Eco-Points yang ingin digunakan sebagai diskon, dengan total harga yang diperbarui secara langsung (*real-time*).

### D. Volunteer Hub (Events)
*   **Event List**: Desain *feed* atau *list* kartu lebar. Menampilkan gambar *banner* (*event*), judul, tanggal, lokasi, dan *Reward Points* (Aksen emas).
*   **RSVP Action**: Tombol "Ikut Serta" yang interaktif. Jika sudah mendaftar, berubah menjadi QR Code atau status "Terdaftar".

### E. AI Eco-Assistant (Chat UI)
*   **Floating Button (FAB)**: Tombol *chat* di sudut kanan bawah dengan ikon robot/daun.
*   **Chat Window**: Jendela *chat* bergaya modern (mirip *chat bubble* iMessage/WhatsApp), menggunakan *avatar* kustom untuk bot.

## 6. Animasi & Interaksi (*Micro-interactions*)
*   **Page Transitions**: Pindah halaman menggunakan animasi *fade* yang mulus.
*   **Hover States**: Kartu sedikit terangkat dan bayangan membesar (*scale-up* 102%, *shadow-lg*).
*   **Point Increment**: Saat poin bertambah (setelah transaksi), angka akan menghitung naik secara dinamis (*counter animation*) dan mungkin diikuti konfeti ringan.
*   **Loading States**: Menggunakan komponen *skeleton loader* yang berkedip halus (*pulse*) alih-alih *spinner* biasa untuk UI yang lebih premium.
