# EcoHub 🌱

EcoHub adalah sebuah **Platform Ekonomi Sirkular Pintar & Berkelanjutan** yang bertujuan untuk mengubah limbah sampah menjadi manfaat untuk masa depan yang lebih hijau. Aplikasi ini menghubungkan masyarakat umum, pengepul/bank sampah tingkat RW (Admin), dan perusahaan pembeli limbah (B2B Buyer) dalam satu ekosistem yang saling menguntungkan melalui sistem *gamifikasi* dan tukar poin (*Eco Points*).

---

## ✨ Fitur Utama

Aplikasi EcoHub memiliki berbagai fitur unggulan dan keunikan yang membedakannya dari platform bank sampah biasa:

1. **Sistem Poin (Eco Points) & Gamifikasi**  
   Setiap warga yang menyetorkan sampah (plastik, kaca, kertas) akan mendapatkan poin. Terdapat sistem pencapaian (Badge) dan papan peringkat (Leaderboard) bulanan yang membuat pengguna semakin semangat mendaur ulang.
2. **Marketplace (Eco-Shop)**  
   Eco Points yang dikumpulkan dapat langsung ditukarkan/dibelanjakan pada katalog marketplace untuk mendapatkan barang-barang hasil *upcycle* atau produk ramah lingkungan lainnya. (Mendukung simulasi pembayaran QRIS).
3. **Volunteer Hub**  
   Pengguna dapat mendaftar dan mengikuti berbagai kegiatan lingkungan (seperti *beach cleanup* atau edukasi daur ulang) secara langsung melalui platform dan mendapatkan poin tambahan.
4. **B2B Dashboard terintegrasi**  
   Perusahaan atau pabrik daur ulang (B2B) memiliki akses dashboard khusus untuk membeli limbah hasil kumpul warga dalam jumlah besar (*bulk*) langsung dari bank sampah.
5. **Dashboard Admin yang Komprehensif**  
   Admin/Ketua RW dapat dengan mudah mencatat transaksi sampah warga, memvalidasi data, dan memantau analitik penyetoran sampah di wilayahnya.

---

## 🛠️ Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan arsitektur *Client-Server* modern (Monorepo) dengan perpaduan teknologi berikut:

### **Frontend (Aplikasi Klien)**
* **Framework:** Next.js (versi 16+)
* **Library UI & Styling:** React 19, Tailwind CSS v4, shadcn/ui, Base UI
* **Animasi:** GSAP (GreenSock) & `tw-animate-css` untuk micro-interactions premium
* **Peta & Lokasi:** React Leaflet
* **Lainnya:** Lucide React (Ikon), QR Code Scanner (`@yudiel/react-qr-scanner`)

### **Backend (API Server)**
* **Environment:** Node.js
* **Framework:** Express.js (v5)
* **Database & ORM:** PostgreSQL dengan Prisma ORM
* **Keamanan:** JSON Web Token (JWT) untuk autentikasi dan otorisasi, Bcrypt.js (Hashing password)
* **Lainnya:** Nodemailer (Kirim Email/OTP)

---

## ⚙️ Cara Instalasi (Setup)

Ikuti langkah-langkah berikut untuk menjalankan EcoHub di mesin lokal Anda.

### 1. Prasyarat (*Prerequisites*)
* Pastikan [Node.js](https://nodejs.org/) (minimal versi 20) sudah terinstal.
* Pastikan PostgreSQL server sudah berjalan.

### 2. Kloning Repositori
```bash
git clone https://github.com/ardhyair10/EcoHub.git
cd EcoHub
```

### 3. Setup Backend
```bash
cd be
npm install

# Buat file konfigurasi environment
cp .env.example .env
```
*(Buka file `.env` di folder `be` lalu sesuaikan kredensial `DATABASE_URL` ke database PostgreSQL lokal Anda, serta masukkan rahasia untuk `JWT_SECRET`)*

Jalankan migrasi database menggunakan Prisma:
```bash
npx prisma db push
npx prisma db seed # (opsional jika Anda memiliki file seed)
```

### 4. Setup Frontend
Buka terminal baru:
```bash
cd fe
npm install

# Buat file konfigurasi environment
cp .env.example .env.local
```
*(Buka file `.env.local` di folder `fe` dan pastikan `NEXT_PUBLIC_API_URL` mengarah ke URL backend Anda, misal: `http://localhost:5000`)*

---

## 🚀 Cara Penggunaan

Setelah semua terinstal, jalankan perintah berikut secara bersamaan di dua terminal yang berbeda.

**Terminal 1: Menjalankan Backend (API)**
```bash
cd be
npm run dev
```
*Backend akan berjalan di port `5000` (atau sesuai konfigurasi di file .env)*

**Terminal 2: Menjalankan Frontend (Web App)**
```bash
cd fe
npm run dev
```
*Frontend akan berjalan di `http://localhost:3000` (atau port 3001 jika port 3000 sedang terpakai).*

Buka browser Anda dan navigasikan ke `http://localhost:3000` untuk mulai menggunakan EcoHub!

### 🔑 Akun Demo (Admin)
Untuk masuk dan mencoba fitur Dashboard Admin, Anda dapat menggunakan kredensial berikut:
- **Email:** `admin@ecohub.id`
- **Password:** `admin`

---
*Dibuat untuk bumi yang lebih hijau.* 🌍
