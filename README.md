# 📈 Smart IPO Calculator & Simulator

Aplikasi web responsif modern berbasis **Dark Glassmorphism** yang berfungsi sebagai alat bantu kalkulasi alokasi modal (*money management*) bagi investor retail saham Indonesia. Aplikasi ini mempermudah trader mengatur porsi dana saat berburu beberapa saham IPO secara bersamaan, sekaligus memberikan simulasi proyeksi keuntungan (**ARA**) dan risiko kerugian (**ARB**) secara presisi pada hari pertama listing.

---

## 📖 Product Requirement Document (PRD) - Ringkasan Eksekutif

### 1. Project Overview & Objectives
* **Nama Proyek:** Kalkulator IPO Saham Indonesia (Web-Based App)
* **Versi:** 2.0 (Updated dengan Fitur Simulasi ARA/ARB Simetris)
* **Tujuan:** 
  1. Memudahkan pengguna membagi modal ke beberapa saham IPO yang sedang aktif secara *real-time*.
  2. Meminimalkan risiko *over-budget* (pesanan melebihi modal awal).
  3. Menyajikan data status penawaran saham IPO secara otomatis melalui mekanisme *web scraping*.
  4. Memberikan proyeksi keuntungan (ARA) dan kerugian (ARB) secara transparan sejak dini[cite: 1].

### 2. Functional Requirements (Fitur Utama)

#### A. Manajemen Modal (Capital Input)
* **Deskripsi:** Kolom utama bagi pengguna untuk menginput total dana tunai yang dialokasikan untuk berburu IPO pada periode tersebut[cite: 1].
* **Kriteria Penerimaan:**
  * Kolom hanya menerima input angka positif[cite: 1].
  * Menampilkan format mata uang Rupiah secara dinamis (contoh: `Rp 10.000.000`)[cite: 1].
  * Menyediakan metrik **"Sisa Saldo"** yang dihitung secara *real-time*: `Sisa Saldo = Modal Awal - Total Akumulasi Pesanan`[cite: 1].
  * Jika `Sisa Saldo < 0`, teks indikator berubah menjadi warna merah tebal sebagai peringatan *over-budget*[cite: 1].

#### B. Manajemen Data IPO (Scraped Dataset)
* **Deskripsi:** Sistem menampilkan daftar emiten yang sedang berada dalam fase *Bookbuilding* atau *Offering* hasil scraping dari situs e-IPO[cite: 1].
* **Atribut Data Per Saham:** Kode Saham (Ticker Code), Nama Perusahaan, Harga Saham (Rentang harga atau harga tunggal), dan Status Fase[cite: 1].

#### C. Komponen Kalkulator Pesanan (Lot Calculator)
* **Deskripsi:** Kolom interaktif di setiap baris saham agar pengguna bisa memasukkan jumlah lot target[cite: 1].
* **Rumus Perhitungan Dasar IDX:**
  $$\text{Total Harga Pesanan} = \text{Harga Saham} \times (\text{Jumlah Lot} \times 100)$$[cite: 1]
* **Kriteria UI:** Menggunakan *reactive state* (React `useState`). Begitu jumlah lot berubah, nominal total harga per saham langsung ter-update tanpa *reload* halaman[cite: 1].

#### D. Modul Simulator ARA & ARB (Auto Rejection Simulator)
* **Deskripsi:** Fitur simulasi pergerakan harga ekstrem pada hari pertama listing berdasarkan aturan **Auto Rejection Simetris IDX**[cite: 1].
* **Logika Batasan Aturan (Tiering System):**
  * **Harga Rp50 – Rp200:** Batas ARA/ARB = **35%** (`0.35`)[cite: 1]
  * **Harga >Rp200 – Rp5.000:** Batas ARA/ARB = **25%** (`0.25`)[cite: 1]
  * **Harga >Rp5.000:** Batas ARA/ARB = **20%** (`0.20`)[cite: 1]
* **Rumus Perhitungan Proyeksi:**
  * $\text{Harga ARA} = \text{Harga Saham} \times (1 + \text{Persentase Batas})$[cite: 1]
  * $\text{Harga ARB} = \text{Harga Saham} \times (1 - \text{Persentase Batas})$[cite: 1]
  * *Catatan Penting:* Nilai Harga ARA dan ARB wajib dibulatkan sesuai dengan **Fraksi Harga IDX** terdekat (kelipatan Rp1, Rp2, Rp5, Rp10, atau Rp25) agar hasil simulasi presisi dengan bursa nyata[cite: 1].
* **Metrik Output yang Ditampilkan:** Estimasi Nilai Portofolio (ARA/ARB)[cite: 1] dan *Floating PnL* (Nominal Rp & Persentase % keuntungan/kerugian)[cite: 1].

### 3. Non-Functional Requirements & UI/UX Guidelines
* **Mobile Layout (< 768px):** Tampilan berbasis komponen **Card**[cite: 1]. Input Modal dan Sisa Saldo dipasang sebagai elemen **Sticky/Fixed** di bagian atas atau bawah layar[cite: 1]. Detail ARA/ARB disembunyikan di dalam komponen **Accordion (Dropdown)** untuk menghemat ruang[cite: 1].
* **Tablet & Desktop Layout (>= 768px):** Tampilan berbentuk **Data Table Grid** horizontal penuh, menampilkan semua kolom secara berdampingan untuk komparasi instan[cite: 1].
* **State Persistence:** Input lot pengguna disimpan otomatis di `localStorage` frontend agar data tidak hilang saat halaman tidak sengaja di-refresh oleh pengguna[cite: 1].

---

## 🛠️ Tech Stack & Arsitektur

* **Frontend:** React.js, Tailwind CSS (Custom Theme: Dark Glassmorphism), Lucide React Icons[cite: 1].
* **Backend:** Python 3.x, FastAPI[cite: 1].
* **Scraper & Cache:** Beautiful Soup 4 / Playwright, File-Based JSON caching harian (`data_ipo.json`)[cite: 1].

---

## 🚀 Memulai Pengembangan (Local Development)

Pastikan komputer Anda sudah terinstal **Node.js (v18+)** dan **Python (v3.9+)**[cite: 1].

### 1. Kloning Repositori
```bash
git clone [https://github.com/username/nama-repositori.git](https://github.com/username/nama-repositori.git)
cd nama-repositori
