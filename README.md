# 📈 IPO Stock Calculator & ARA/ARB Simulator Indonesia

A web app that helps Indonesian retail investors manage their capital allocation when hunting multiple IPO stocks at once, complete with a profit (ARA) and loss (ARB) projection simulator for the first day of listing.

🔗 **Live Demo:** [kalkulator-ipo.vercel.app](https://kalkulator-ipo.vercel.app/)

🇮🇩 [Baca dalam Bahasa Indonesia](./README.id.md)

---

## ✨ Background

During IPO bookbuilding periods, retail investors often chase more than one stock at a time with limited funds. Without a proper tool, it's easy to over-allocate the budget or miscalculate first-day profit/loss projections. This app was built to solve that problem automatically and in real time.

## 🚀 Key Features

- **Capital Management** — Enter available cash with auto-formatted Rupiah input, plus a "Remaining Balance" indicator that turns red when allocation exceeds capital.
- **Live IPO Data** — List of issuers currently in the Bookbuilding/Offering phase, fetched automatically via web scraping from the e-IPO site.
- **Lot Calculator** — Real-time total order value calculation as lot quantity changes, no page reload needed.
- **ARA/ARB Simulator** — Auto Rejection Upper/Lower price projections based on IDX tiering rules (35%/25%/20%), rounded to the nearest IDX price fraction, with estimated floating PnL.
- **Fully Responsive** — Card + accordion layout on mobile, data table grid on tablet/desktop.
- **State Persistence** — Lot inputs are auto-saved to localStorage, safe from accidental refreshes.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS (custom dark glassmorphism theme), Lucide Icons |
| Backend | Python, FastAPI |
| Scraper & Cache | BeautifulSoup4 / Playwright, daily JSON caching |
| Deployment | Vercel |

## 📸 Preview

<img width="2856" height="1542" alt="image" src="https://github.com/user-attachments/assets/27824aaf-1412-49ba-a684-bd1202437e31" />

## ⚙️ Running Locally

Make sure you have **Node.js v18+** and **Python 3.9+** installed.

```bash
# 1. Clone the repository
git clone https://github.com/dayywkd/Kalkulator-IPO.git
cd Kalkulator-IPO

# 2. Set up the backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# 3. Set up the frontend (new terminal)
cd frontend
npm install
npm run dev
```

## 🧮 Calculation Logic

**Total Order Value**
```
Total Order Value = Stock Price × (Number of Lots × 100)
```

**ARA/ARB Projection** (rounded to the nearest IDX price fraction)
```
ARA Price = Stock Price × (1 + Limit Percentage)
ARB Price = Stock Price × (1 - Limit Percentage)
```

Limit percentage follows IDX tiering rules:
| Price Range | ARA/ARB Limit |
|---|---|
| Rp50 – Rp200 | 35% |
| >Rp200 – Rp5,000 | 25% |
| >Rp5,000 | 20% |

## 👤 My Role

Built solo as a full-stack developer — covering UI/UX design, data scraping architecture, IDX-compliant calculation logic, and deployment.

## 📄 License

MIT License — free to use and modify.
