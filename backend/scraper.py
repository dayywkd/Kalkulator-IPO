import json
import os
import requests
from bs4 import BeautifulSoup

MOCK_FILE_PATH = os.path.join(os.path.dirname(__file__), "mock_ipo.json")

def load_fallback_data():
    """Memuat data IPO simulasi dari mock_ipo.json."""
    if os.path.exists(MOCK_FILE_PATH):
        try:
            with open(MOCK_FILE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[Scraper] Error loading mock file: {e}")
            return []
    return []

def scrape_ipo_data():
    """
    Melakukan scraping data IPO aktif dari situs e-IPO.
    Mendukung penanganan Cloudflare / pemblokiran akses dengan fallback data.
    """
    url = "https://e-ipo.co.id/id/ipo/index"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    }
    
    try:
        # Melakukan request dengan timeout singkat untuk mencegah hang
        response = requests.get(url, headers=headers, timeout=10)
        
        # Jika diblokir (403/503 dll), gunakan fallback
        if response.status_code != 200:
            print(f"[Scraper] Gagal mengakses e-IPO (Status Code: {response.status_code}). Menggunakan fallback data.")
            return load_fallback_data()
            
        soup = BeautifulSoup(response.text, "html.parser")
        
        # e-IPO menggunakan arsitektur SPA yang memuat data secara asinkron.
        # Karenanya, HTML statis dari root URL sering kali tidak memuat daftar emiten secara langsung.
        # Kami mendeteksi card emiten (jika di-render statis oleh server)
        cards = soup.find_all(class_="ipo-card")
        
        if not cards:
            print("[Scraper] Halaman e-IPO menggunakan dynamic JS rendering atau dilindungi Cloudflare. Menggunakan fallback data simulasi.")
            return load_fallback_data()
            
        ipo_items = []
        for card in cards:
            try:
                # Ekstraksi data secara aman
                ticker_el = card.find(class_="ticker")
                name_el = card.find(class_="company-name")
                price_el = card.find(class_="price")
                phase_el = card.find(class_="phase")
                
                if not (ticker_el and name_el and price_el):
                    continue
                    
                ticker = ticker_el.text.strip()
                name = name_el.text.strip()
                price_text = price_el.text.strip()
                phase = phase_el.text.strip() if phase_el else "Offering"
                
                # Parsing detail harga
                min_price = 0
                max_price = 0
                price = 0
                
                # Membersihkan tanda rupiah dan titik pemisah ribuan
                clean_price_text = price_text.replace("Rp", "").replace(".", "").strip()
                
                if "-" in clean_price_text:
                    parts = clean_price_text.split("-")
                    min_price = int("".join(filter(str.isdigit, parts[0])))
                    max_price = int("".join(filter(str.isdigit, parts[1])))
                    price = max_price  # Gunakan batas atas untuk kalkulasi default
                else:
                    price = int("".join(filter(str.isdigit, clean_price_text)))
                    min_price = price
                    max_price = price
                
                ipo_items.append({
                    "ticker": ticker,
                    "name": name,
                    "price_range": price_text,
                    "min_price": min_price,
                    "max_price": max_price,
                    "price": price,
                    "phase": phase
                })
            except Exception as e:
                print(f"[Scraper] Gagal melakukan parsing card emiten: {e}")
                continue
                
        if not ipo_items:
            return load_fallback_data()
            
        return ipo_items
        
    except Exception as e:
        print(f"[Scraper] Koneksi ke e-IPO gagal atau timeout: {e}. Menggunakan fallback data.")
        return load_fallback_data()
