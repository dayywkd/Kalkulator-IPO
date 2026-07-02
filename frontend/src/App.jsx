import React, { useState, useEffect } from 'react';
import CapitalHeader from './components/CapitalHeader';
import IPOTable from './components/IPOTable';
import IPOCard from './components/IPOCard';
import SequentialAraSimulator from './components/SequentialAraSimulator';
import AllocationChart from './components/AllocationChart';
import { calculateAraArb, formatRupiah } from './utils/calculatorHelper';

const FALLBACK_IPO_LIST = [
  {
    ticker: "JELI",
    name: "PT Niramas Utama Tbk (INACO)",
    price_range: "900",
    min_price: 900,
    max_price: 900,
    price: 900,
    phase: "Offering"
  },
  {
    ticker: "JECX",
    name: "PT Nitrasanata Dharma Tbk",
    price_range: "1250",
    min_price: 1250,
    max_price: 1250,
    price: 1250,
    phase: "Offering"
  },
  {
    ticker: "PRDL",
    name: "PT Prodia Diagnostic Line Tbk",
    price_range: "120",
    min_price: 120,
    max_price: 120,
    price: 120,
    phase: "Offering"
  },
  {
    ticker: "BACH",
    name: "PT Bach Multi Global Tbk",
    price_range: "442",
    min_price: 442,
    max_price: 442,
    price: 442,
    phase: "Offering"
  },
  {
    ticker: "EMMI",
    name: "PT Esa Medika Mandiri Tbk",
    price_range: "470",
    min_price: 470,
    max_price: 470,
    price: 470,
    phase: "Offering"
  },
  {
    ticker: "RANS",
    name: "PT Rans Entertainment Indonesia Tbk",
    price_range: "170",
    min_price: 170,
    max_price: 170,
    price: 170,
    phase: "Offering"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' atau 'sequential'

  // State 1: Modal Awal (Capital)
  const [capital, setCapital] = useState(() => {
    const saved = localStorage.getItem("ipo_capital");
    return saved ? parseInt(saved, 10) : 10000000; // default Rp 10 Juta
  });

  // State 2: Inputan Lot per Saham (Object key: ticker, value: lot)
  const [orderLots, setOrderLots] = useState(() => {
    const saved = localStorage.getItem("ipo_lots");
    return saved ? JSON.parse(saved) : {};
  });

  // State 3: Harga Terpilih untuk Bookbuilding (Object key: ticker, value: price)
  const [selectedPrices, setSelectedPrices] = useState(() => {
    const saved = localStorage.getItem("ipo_prices");
    return saved ? JSON.parse(saved) : {};
  });

  // State Data IPO & Status Koneksi API
  const [ipoList, setIpoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Fetch data dari FastAPI Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
        const response = await fetch(`${apiUrl}/api/ipo`);
        if (!response.ok) {
          throw new Error("Respon API tidak sukses");
        }
        const json = await response.json();
        setIpoList(json.data);
        setIsOfflineMode(false);
      } catch (err) {
        console.warn("Gagal terhubung ke server backend API. Mengaktifkan mode simulator offline.", err);
        setIpoList(FALLBACK_IPO_LIST);
        setIsOfflineMode(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Sinkronisasi State ke localStorage
  useEffect(() => {
    localStorage.setItem("ipo_capital", capital.toString());
  }, [capital]);

  useEffect(() => {
    localStorage.setItem("ipo_lots", JSON.stringify(orderLots));
  }, [orderLots]);

  useEffect(() => {
    localStorage.setItem("ipo_prices", JSON.stringify(selectedPrices));
  }, [selectedPrices]);

  // Kalkulasi Total Akumulasi Pesanan
  const totalOrder = ipoList.reduce((acc, ipo) => {
    const lot = orderLots[ipo.ticker] || 0;
    const price = selectedPrices[ipo.ticker] !== undefined ? selectedPrices[ipo.ticker] : ipo.price;
    return acc + (price * lot * 100);
  }, 0);

  // Perhitungan Proyeksi Portofolio Kumulatif
  let totalAraPnL = 0;
  let totalArbPnL = 0;
  let hasActiveOrder = false;

  ipoList.forEach(ipo => {
    const lot = orderLots[ipo.ticker] || 0;
    if (lot > 0) {
      hasActiveOrder = true;
      const currentPrice = selectedPrices[ipo.ticker] !== undefined ? selectedPrices[ipo.ticker] : ipo.price;
      const orderValue = currentPrice * lot * 100;
      
      const { araPrice, arbPrice } = calculateAraArb(currentPrice);
      
      const araVal = araPrice * lot * 100;
      const arbVal = arbPrice * lot * 100;
      
      totalAraPnL += (araVal - orderValue);
      totalArbPnL += (arbVal - orderValue);
    }
  });

  const totalAraPnLPercentage = totalOrder > 0 ? (totalAraPnL / totalOrder) * 100 : 0;
  const totalArbPnLPercentage = totalOrder > 0 ? (totalArbPnL / totalOrder) * 100 : 0;

  const [showResetModal, setShowResetModal] = useState(false);

  const confirmReset = () => {
    setOrderLots({});
    setSelectedPrices({});
    setShowResetModal(false);
  };

  return (
    <div className="min-h-screen pb-16">
      
      {/* Header Utama */}
      <header className="pt-8 pb-4 text-center max-w-7xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-200 bg-clip-text text-transparent drop-shadow-sm">
          Kalkulator & Simulator ARA/ARB IPO
        </h1>
        <p className="text-sm md:text-base text-gray-400 mt-2 max-w-xl mx-auto">
          Maksimalkan money management pesanan e-IPO Anda. Hitung potensi profit dan batasi risiko hari pertama listing secara otomatis sesuai regulasi IDX.
        </p>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 mb-6 flex justify-center">
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 shadow-inner backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('daily')}
            className={`py-2 px-4 sm:px-6 rounded-lg text-[11px] sm:text-xs md:text-sm font-bold tracking-wide transition-all cursor-pointer active:scale-95 whitespace-nowrap ${
              activeTab === 'daily'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-900/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="inline sm:hidden">Kalkulator Harian</span>
            <span className="hidden sm:inline">Kalkulator Harian (Hari ke-1)</span>
          </button>
          <button
            onClick={() => setActiveTab('sequential')}
            className={`py-2 px-4 sm:px-6 rounded-lg text-[11px] sm:text-xs md:text-sm font-bold tracking-wide transition-all cursor-pointer active:scale-95 whitespace-nowrap ${
              activeTab === 'sequential'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-900/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="inline sm:hidden">Simulasi ARA</span>
            <span className="hidden sm:inline">Simulasi ARA 1 Minggu</span>
          </button>
        </div>
      </div>

      {/* Indikator Status API Offline */}
      {isOfflineMode && (
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg p-3 text-xs flex items-center justify-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span><strong>Mode Simulator Offline:</strong> Server API backend lokal tidak terdeteksi. Sistem menyajikan data saham simulasi.</span>
          </div>
        </div>
      )}

      {/* Sticky Capital & Balance Header */}
      <CapitalHeader 
        capital={capital} 
        setCapital={setCapital} 
        totalOrder={totalOrder} 
      />

      <main className="max-w-7xl mx-auto px-4 flex flex-col gap-6">
        {activeTab === 'daily' ? (
          <>
            {/* Panel Ringkasan Potensi Proyeksi ARA / ARB & Alokasi Dana */}
            {hasActiveOrder && (
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                {/* Ringkasan Profit ARA */}
                <div className="glass-panel rounded-xl p-5 border-l-4 border-emerald-500 shadow-md">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Potensi Profit Maksimal (Hari ke-1 ARA)</div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl md:text-3xl font-extrabold text-emerald-400">
                      +{formatRupiah(totalAraPnL)}
                    </span>
                    <span className="text-sm font-bold bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded">
                      +{totalAraPnLPercentage.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Proyeksi nilai total portofolio Anda akan menjadi <strong className="text-white">{formatRupiah(totalOrder + totalAraPnL)}</strong> jika seluruh saham yang dipesan mengalami Auto Rejection Atas di hari pertama.
                  </p>
                </div>

                {/* Ringkasan Risiko ARB */}
                <div className="glass-panel rounded-xl p-5 border-l-4 border-rose-500 shadow-md">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Potensi Kerugian Maksimal (Hari ke-1 ARB)</div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl md:text-3xl font-extrabold text-rose-400">
                      {formatRupiah(totalArbPnL)}
                    </span>
                    <span className="text-sm font-bold bg-rose-500/15 text-rose-400 px-2 py-0.5 rounded">
                      {totalArbPnLPercentage.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Proyeksi nilai total portofolio Anda akan menjadi <strong className="text-white">{formatRupiah(totalOrder + totalArbPnL)}</strong> jika seluruh saham yang dipesan mengalami Auto Rejection Bawah di hari pertama.
                  </p>
                </div>

                {/* Donut Chart Alokasi Dana */}
                <AllocationChart 
                  ipoList={ipoList}
                  orderLots={orderLots}
                  selectedPrices={selectedPrices}
                  totalOrder={totalOrder}
                  capital={capital}
                />
              </section>
            )}

            {/* Dashboard Main Content */}
            <section className="flex flex-col gap-4">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-lg md:text-xl font-bold text-white tracking-wide">
                  Daftar Penawaran IPO Aktif
                </h2>
                {hasActiveOrder && (
                  <button 
                    onClick={() => setShowResetModal(true)}
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 py-1.5 px-3 rounded-lg active:scale-95 transition-all cursor-pointer"
                  >
                    Reset Pilihan
                  </button>
                )}
              </div>

              {loading ? (
                <div className="glass-panel rounded-xl p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
                  <svg className="animate-spin h-8 w-8 text-violet-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Memuat data IPO saham...</span>
                </div>
              ) : (
                <>
                  {/* Tampilan Tabel Desktop */}
                  <IPOTable 
                    ipoList={ipoList}
                    orderLots={orderLots}
                    setOrderLots={setOrderLots}
                    selectedPrices={selectedPrices}
                    setSelectedPrices={setSelectedPrices}
                  />

                  {/* Tampilan Card Mobile */}
                  <IPOCard 
                    ipoList={ipoList}
                    orderLots={orderLots}
                    setOrderLots={setOrderLots}
                    selectedPrices={selectedPrices}
                    setSelectedPrices={setSelectedPrices}
                  />
                </>
              )}
            </section>
          </>
        ) : (
          <SequentialAraSimulator 
            ipoList={ipoList}
            orderLots={orderLots}
            selectedPrices={selectedPrices}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      {/* Custom Premium Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop Blur */}
          <div 
            className="absolute inset-0 bg-black/65 backdrop-blur-md transition-opacity"
            onClick={() => setShowResetModal(false)}
          />
          
          {/* Modal Container */}
          <div className="relative glass-panel max-w-xs w-full rounded-2xl border border-white/10 p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              {/* Warning Icon */}
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-bold text-white tracking-wide">
                Reset Kalkulator?
              </h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Apakah Anda yakin ingin mengosongkan seluruh jumlah lot pesanan saham IPO Anda?
              </p>

              {/* Buttons */}
              <div className="flex w-full gap-3 mt-6">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-2 rounded-xl border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={confirmReset}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-lg shadow-rose-900/20 active:scale-95 transition-all cursor-pointer"
                >
                  Ya, Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
