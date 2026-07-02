from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from scraper import scrape_ipo_data

app = FastAPI(
    title="Kalkulator & Simulator IPO API",
    description="API untuk menyajikan daftar saham IPO aktif di Indonesia secara real-time.",
    version="2.0.0"
)

# Mengizinkan akses dari domain frontend (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Mengizinkan semua origin untuk kemudahan development lokal
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/ipo")
def get_ipo_list():
    """
    Mengembalikan daftar saham IPO aktif (Bookbuilding / Offering) hasil scraping
    atau data fallback jika e-IPO tidak dapat diakses.
    """
    data = scrape_ipo_data()
    return {
        "status": "success",
        "count": len(data),
        "data": data
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
