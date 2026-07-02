# Product Requirement Document (PRD)
## Kalkulator & Simulator ARA/ARB IPO Saham Indonesia

---

## 1. Project Overview & Objectives
* **Nama Proyek:** Kalkulator IPO Saham Indonesia (Web-Based App)
* **Versi:** 2.0 (Updated dengan Fitur Simulasi ARA/ARB Simetris)
* **Deskripsi:** Sebuah aplikasi berbasis web responsif yang berfungsi sebagai alat bantu kalkulasi alokasi modal (*money management*) bagi investor retail saat memesan beberapa saham IPO (Initial Public Offering) di Indonesia secara bersamaan, sekaligus mensimulasikan potensi profit/loss berdasarkan batas Auto Rejection hari pertama listing.
* **Tujuan:** 1. Memudahkan pengguna membagi modal ke beberapa saham IPO yang sedang aktif secara *real-time*.
  2. Meminimalkan risiko *over-budget* (pesanan melebihi modal awal).
  3. Menyajikan data status penawaran saham IPO secara otomatis melalui mekanisme *web scraping*.
  4. Memberikan proyeksi keuntungan (ARA) dan kerugian (ARB) secara transparan sejak dini.

---

## 2. Target Audience & Platform Support
* **Target Pengguna:** Investor saham retail Indonesia, pemburu saham IPO (*IPO Hunters*).
* **Dukungan Platform:** Aplikasi Web Responsif (Pendekatan *Mobile-First Design*). Dioptimalkan secara penuh untuk:
  * **Mobile:** Penggunaan cepat via smartphone saat memantau pasar.
  * **Tablet & Desktop:** Tampilan multi-kolom yang komprehensif untuk analisis mendalam.

---

## 3. Architecture & Tech Stack
* **Frontend:** React.js, Tailwind CSS (untuk layout utility-first yang responsif).
* **Backend & Data Scraper:** Python (Flask atau FastAPI) + Beautiful Soup / Playwright untuk mengambil data harian dari situs e-IPO resmi.
* **Data Format:** JSON API Internal untuk menjembatani hasil scraping dari backend ke state management React.

---

## 4. Functional Requirements (Fitur Utama)

### 4.1. Manajemen Modal (Capital Input)
* **Deskripsi:** Kolom utama bagi pengguna untuk menginput total dana tunai yang dialokasikan untuk berburu IPO pada periode tersebut.
* **Kriteria Penerimaan (Acceptance Criteria):**
  * Kolom hanya menerima input angka positif.
  * Menampilkan format mata uang Rupiah secara dinamis (contoh: `Rp 10.000.000`).
  * Menyediakan metrik **"Sisa Saldo"** yang dihitung secara *real-time*: `Sisa Saldo = Modal Awal - Total Akumulasi Pesanan`.
  * Jika `Sisa Saldo < 0`, teks indikator berubah menjadi warna merah tebal sebagai peringatan *over-budget*.

### 4.2. Manajemen Data IPO (Scraped Dataset)
* **Deskripsi:** Sistem menampilkan daftar emiten yang sedang berada dalam fase *Bookbuilding* atau *Offering*.
* **Atribut Data Per Saham:**
  * Kode Saham (Ticker Code, misal: `JECX`, `JELI`).
  * Nama Perusahaan.
  * Harga Saham (Harga tunggal jika sudah *offering*, atau batas bawah/atas jika masih *bookbuilding*).
  * Status Fase (Bookbuilding / Offering).

### 4.3. Komponen Kalkulator Pesanan (Lot Calculator)
* **Deskripsi:** Kolom interaktif di setiap baris saham agar pengguna bisa memasukkan jumlah lot target.
* **Rumus Perhitungan Dasar IDX:**
  $$	ext{Total Harga Pesanan} = 	ext{Harga Saham} 	imes (	ext{Jumlah Lot} 	imes 100)$$
* **Kriteria UI:** Menggunakan *reactive state* (React `useState`). Begitu jumlah lot berubah, nominal total harga per saham langsung ter-update tanpa *reload* halaman.

### 4.4. Modul Simulator ARA & ARB (Auto Rejection Simulator)
* **Deskripsi:** Fitur simulasi pergerakan harga ekstrem pada hari pertama listing berdasarkan aturan **Auto Rejection Simetris IDX**.
* **Logika Batasan Aturan (Tiering System):**
  * **Harga Rp50 – Rp200:** Batas ARA/ARB = **35%** (`0.35`)
  * **Harga >Rp200 – Rp5.000:** Batas ARA/ARB = **25%** (`0.25`)
  * **Harga >Rp5.000:** Batas ARA/ARB = **20%** (`0.20`)
* **Rumus Perhitungan Proyeksi:**
  * $	ext{Harga ARA} = 	ext{Harga Saham} 	imes (1 + 	ext{Persentase Batas})$
  * $	ext{Harga ARB} = 	ext{Harga Saham} 	imes (1 - 	ext{Persentase Batas})$
  * *Catatan Penting:* Nilai Harga ARA dan ARB wajib dibulatkan sesuai dengan **Fraksi Harga IDX** terdekat (kelipatan Rp1, Rp2, Rp5, Rp10, atau Rp25) agar hasil simulasi presisi dengan bursa nyata.
* **Metrik Output yang Ditampilkan:**
  * **Estimasi Nilai Portofolio (ARA/ARB):** $	ext{Harga Proyeksi} 	imes 	ext{Jumlah Lot} 	imes 100$.
  * **Floating PnL (Nominal & Persentase):** Menampilkan proyeksi keuntungan bersih (hijau) atau potensi kerugian maksimal (merah).

---

## 5. Non-Functional Requirements & UI/UX Guidelines

### 5.1. Responsive Layout Strategy (Breakpoints)
* **Mobile Layout (< 768px):**
  * Tampilan berbasis komponen **Card**. Setiap emiten diwakili oleh satu card.
  * Input Modal dan Sisa Saldo dipasang sebagai elemen **Sticky/Fixed** di bagian atas atau bawah layar agar tetap terlihat saat *scrolling*.
  * Detail ARA/ARB disembunyikan di dalam komponen **Accordion (Dropdown)**. Pengguna harus menekan tombol "Lihat Estimasi ARA/ARB" untuk membuka panel detail demi menghemat ruang layar.
* **Tablet & Desktop Layout (>= 768px):**
  * Tampilan berbentuk **Data Table Grid** horizontal yang komprehensif.
  * Semua kolom (Harga, Lot, Total, Proyeksi ARA, Proyeksi ARB) ditampilkan berdampingan dalam satu baris penuh sehingga mempermudah komparasi instan antarsaham.

### 5.2. Format & Validasi Data
* Otomatisasi pemisah ribuan (*thousand separators*) menggunakan format lokal Indonesia (`id-ID`).
* *Error Handling:* Jika input lot kosong atau bukan angka, sistem secara anggun memperlakukannya sebagai `0` tanpa merusak kalkulasi baris lainnya.

---

## 6. Struktur Komponen React (Arsitektur Frontend)
Sebagai panduan koding, berikut struktur komponen esensial yang direkomendasikan:
1. `<Dashboard />`: Komponen induk yang memegang *global state* (modalAwal, daftarSaham).
2. `<CapitalHeader />`: Komponen sticky untuk input modal dan kalkulasi sisa saldo.
3. `<IPOTable />`: Wadah utama pembungkus list saham (Desktop view).
4. `<IPOCard />`: Komponen modular per emiten khusus untuk tampilan Mobile view.
5. `<ARASimulatorPanel />`: Sub-komponen yang menangani logika perkalian persentase bursa dan pembulatan fraksi harga.

---

## 7. Penutup & Timeline Pengembangan
Dokumen ini bersifat final sebagai acuan pengembangan fase pertama (*Minimum Viable Product*). Tahap berikutnya adalah pembuatan struktur folder React dan inisialisasi framework Tailwind CSS.
