# 📈 Kalkulator IPO Saham & Simulator ARA/ARB Indonesia

Aplikasi web untuk membantu investor retail Indonesia mengelola alokasi modal saat memburu beberapa saham IPO sekaligus, lengkap dengan simulasi proyeksi keuntungan (ARA) dan kerugian (ARB) pada hari pertama listing.

🔗 **Live Demo:** [kalkulator-ipo.vercel.app](https://kalkulator-ipo.vercel.app/)

🇬🇧 [Read in English](./README.md)

---

## ✨ Latar Belakang

Saat periode *bookbuilding* IPO, investor retail sering memburu lebih dari satu saham sekaligus dengan modal terbatas. Tanpa alat bantu, mudah terjadi *over-budget* atau salah hitung proyeksi untung-rugi di hari pertama listing. Aplikasi ini dibuat untuk menyelesaikan masalah tersebut secara otomatis dan real-time.

## 🚀 Fitur Utama

- **Manajemen Modal** — Input dana tunai dengan format Rupiah otomatis, dan indikator "Sisa Saldo" yang berubah merah saat alokasi melebihi modal.
- **Data IPO Live** — Daftar emiten yang sedang dalam fase *Bookbuilding*/*Offering*, diambil otomatis lewat web scraping dari situs e-IPO.
- **Kalkulator Lot** — Hitung total nilai pesanan per saham secara real-time saat jumlah lot diubah, tanpa reload halaman.
- **Simulator ARA/ARB** — Proyeksi harga Auto Rejection Atas/Bawah sesuai aturan tiering IDX (35%/25%/20%), dibulatkan ke fraksi harga IDX terdekat, lengkap dengan estimasi floating PnL.
- **Responsif Penuh** — Tampilan card + accordion di mobile, data table grid di tablet/desktop.
- **State Persistence** — Input lot tersimpan otomatis di localStorage, aman dari refresh tidak sengaja.

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React.js, Tailwind CSS (custom dark glassmorphism theme), Lucide Icons |
| Backend | Python, FastAPI |
| Scraper & Cache | BeautifulSoup4 / Playwright, JSON caching harian |
| Deployment | Vercel |

## 📸 Preview

*(tambahkan screenshot atau GIF demo di sini)*

## ⚙️ Menjalankan Secara Lokal

Pastikan sudah terinstal **Node.js v18+** dan **Python 3.9+**.

```bash
# 1. Clone repository
git clone https://github.com/dayywkd/Kalkulator-IPO.git
cd Kalkulator-IPO

# 2. Setup backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# 3. Setup frontend (di terminal baru)
cd frontend
npm install
npm run dev
```

## 🧮 Logika Perhitungan

**Total Pesanan**
```
Total Harga Pesanan = Harga Saham × (Jumlah Lot × 100)
```

**Proyeksi ARA/ARB** (dibulatkan ke fraksi harga IDX terdekat)
```
Harga ARA = Harga Saham × (1 + Persentase Batas)
Harga ARB = Harga Saham × (1 - Persentase Batas)
```

Batas persentase mengikuti tiering IDX:
| Rentang Harga | Batas ARA/ARB |
|---|---|
| Rp50 – Rp200 | 35% |
| >Rp200 – Rp5.000 | 25% |
| >Rp5.000 | 20% |

## 👤 Peran Saya

Dikembangkan solo sebagai *full-stack developer* — mulai dari desain UI/UX, arsitektur scraping data, logika perhitungan sesuai aturan bursa IDX, hingga deployment.

## 📄 Lisensi

MIT License — bebas digunakan dan dimodifikasi.
