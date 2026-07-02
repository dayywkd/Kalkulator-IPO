import React, { useState, useEffect } from 'react';
import { 
  calculateAraArb, 
  formatRupiah, 
  getNextBusinessDays, 
  formatDateIndonesia, 
  simulateSequentialAra 
} from '../utils/calculatorHelper';
import Tooltip from './Tooltip';

export default function SequentialAraSimulator({ ipoList, orderLots, selectedPrices, setActiveTab }) {
  // Ambil daftar emiten yang memiliki pesanan aktif (lot > 0)
  const activeOrders = ipoList.filter(ipo => (orderLots[ipo.ticker] || 0) > 0);

  // State emiten terpilih untuk simulasi detail
  const [selectedTicker, setSelectedTicker] = useState('');
  
  // State durasi simulasi (default 5 hari bursa / 1 minggu)
  const [simulationDays, setSimulationDays] = useState(5);

  // Sinkronisasi ticker terpilih jika daftar activeOrders berubah
  useEffect(() => {
    if (activeOrders.length > 0) {
      if (!selectedTicker || !activeOrders.some(o => o.ticker === selectedTicker)) {
        setSelectedTicker(activeOrders[0].ticker);
      }
    } else {
      setSelectedTicker('');
    }
  }, [activeOrders, selectedTicker]);

  // Jika tidak ada pesanan aktif
  if (activeOrders.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-8 md:p-12 text-center max-w-2xl mx-auto border border-white/5 shadow-xl animate-fade-in flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white tracking-wide">
          Belum Ada Pesanan Aktif
        </h3>
        <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
          Silakan isi jumlah lot pesanan saham IPO Anda di tab **Kalkulator Harian** terlebih dahulu untuk melihat simulasi ARA ke depan.
        </p>
        <button
          onClick={() => setActiveTab('daily')}
          className="mt-2 py-2.5 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 active:scale-95 transition-all cursor-pointer"
        >
          Buka Kalkulator Harian
        </button>
      </div>
    );
  }

  // Perhitungan metrik akumulatif gabungan (Semua Saham) - dinamis sesuai simulationDays
  let totalInitialValue = 0;
  let totalFinalValue = 0;
  const daysCount = parseInt(simulationDays, 10) || 5;

  activeOrders.forEach(ipo => {
    const lot = orderLots[ipo.ticker] || 0;
    const initPrice = selectedPrices[ipo.ticker] !== undefined ? selectedPrices[ipo.ticker] : ipo.price;
    const initialValue = initPrice * lot * 100;
    
    // Simulasikan ARA N hari
    let currentPrice = initPrice;
    for (let i = 1; i <= daysCount; i++) {
      const limitPercentage = currentPrice <= 200 ? 0.35 : (currentPrice <= 5000 ? 0.25 : 0.20);
      const rawAra = currentPrice * (1 + limitPercentage);
      
      let tick = 25;
      if (rawAra < 200) tick = 1;
      else if (rawAra < 500) tick = 2;
      else if (rawAra < 2000) tick = 5;
      else if (rawAra < 5000) tick = 10;
      
      currentPrice = Math.floor(rawAra / tick) * tick;
    }
    const finalValue = currentPrice * lot * 100;
    
    totalInitialValue += initialValue;
    totalFinalValue += finalValue;
  });

  const totalEstProfit = totalFinalValue - totalInitialValue;
  const totalEstProfitPercentage = totalInitialValue > 0 ? (totalEstProfit / totalInitialValue) * 100 : 0;

  // Cari data emiten terpilih
  const currentIpo = activeOrders.find(o => o.ticker === selectedTicker);
  if (!currentIpo) return null;

  const lot = orderLots[currentIpo.ticker] || 0;
  const initPrice = selectedPrices[currentIpo.ticker] !== undefined ? selectedPrices[currentIpo.ticker] : currentIpo.price;
  const initialOrderValue = initPrice * lot * 100;

  // Dapatkan N hari kerja bursa dari tanggal listing
  const businessDays = getNextBusinessDays(currentIpo.listing_date || "2026-07-02", daysCount);
  // Hitung simulasi ARA berurutan
  const simData = simulateSequentialAra(initPrice, daysCount);
  
  // Data simulasi hari terakhir (fallback aman)
  const lastDaySim = simData[simData.length - 1] || { araPrice: initPrice, cumulativePercentage: 0 };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      
      {/* Ringkasan Portofolio Gabungan (Semua Saham) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gradient-to-r from-violet-950/20 via-indigo-950/20 to-emerald-950/20 border border-violet-500/20 rounded-2xl p-5 shadow-lg backdrop-blur-md">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-violet-300/80 uppercase tracking-wider">Total Modal Pesanan (Gabungan)</span>
          <span className="text-xl md:text-2xl font-extrabold text-white mt-1">{formatRupiah(totalInitialValue)}</span>
          <p className="text-[10px] text-gray-400 mt-1">Total akumulasi dana pesanan untuk seluruh saham aktif.</p>
        </div>
        
        <div className="flex flex-col border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-5">
          <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider flex items-center">
            Total Estimasi Profit Gabungan ({daysCount}x ARA)
            <Tooltip content={`Akumulasi keuntungan potensial dari seluruh pesanan saham aktif Anda jika masing-masing ARA berturut-turut selama ${daysCount} hari bursa.`} position="bottom" />
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl md:text-2xl font-extrabold text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
              +{formatRupiah(totalEstProfit)}
            </span>
            <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
              +{totalEstProfitPercentage.toFixed(2)}%
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Total keuntungan bersih jika semua saham yang dipesan ARA {daysCount} hari bursa.</p>
        </div>

        <div className="flex flex-col border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-5">
          <span className="text-[10px] font-bold text-gray-300/80 uppercase tracking-wider">Total Estimasi Nilai Akhir</span>
          <span className="text-xl md:text-2xl font-extrabold text-white mt-1">{formatRupiah(totalFinalValue)}</span>
          <p className="text-[10px] text-gray-400 mt-1">Total proyeksi nilai portofolio Anda setelah ARA berturut-turut.</p>
        </div>
      </div>

      {/* Kontrol Pengaturan Durasi Simulasi (Dinamis) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel rounded-xl p-4 border border-white/5">
        <div className="flex flex-col gap-1">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center">
            Pilih Rentang Waktu Proyeksi ARA
            <Tooltip content="Atur berapa lama durasi simulasi emiten mengalami ARA beruntun. Hari Sabtu & Minggu secara otomatis dilewati dari kalender bursa." position="bottom" />
          </label>
          <div className="flex flex-wrap gap-2 mt-1">
            {[5, 10, 20].map(days => (
              <button
                key={days}
                onClick={() => setSimulationDays(days)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                  daysCount === days
                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {days === 5 ? '1 Minggu (5 Hari)' : days === 10 ? '2 Minggu (10 Hari)' : '1 Bulan (20 Hari)'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-start border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Kustom Durasi:</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="30"
              value={simulationDays}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                if (val === '' || (val >= 1 && val <= 30)) {
                  setSimulationDays(val);
                }
              }}
              onBlur={() => {
                const val = parseInt(simulationDays, 10);
                if (isNaN(val) || val < 1) setSimulationDays(5);
                else if (val > 30) setSimulationDays(30);
              }}
              className="w-16 bg-white/5 border border-white/10 rounded-lg py-1.5 px-2 text-center text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
            />
            <span className="text-xs text-gray-400 font-semibold">Hari Bursa</span>
          </div>
        </div>
      </div>

      {/* Selector Saham Aktif */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel rounded-xl p-4 border border-white/5">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center">
            Pilih Saham IPO untuk Simulasi ARA
            <Tooltip content="Pilih salah satu saham untuk melihat proyeksi detail kenaikan harga dan nilai portofolio hari demi hari." position="bottom" />
          </label>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {activeOrders.map(ipo => (
              <button
                key={ipo.ticker}
                onClick={() => setSelectedTicker(ipo.ticker)}
                className={`py-2 px-4 rounded-xl text-sm font-bold active:scale-95 transition-all cursor-pointer ${
                  selectedTicker === ipo.ticker
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-900/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {ipo.ticker} ({orderLots[ipo.ticker]} Lot)
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-6 text-left sm:text-right sm:justify-end">
          <div>
            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Nilai Pesanan Awal</span>
            <span className="text-xl font-extrabold text-white">{formatRupiah(initialOrderValue)}</span>
            <span className="block text-[10px] text-gray-500">Harga Perdana: {formatRupiah(initPrice)}</span>
          </div>
          
          <div className="border-l border-white/10 pl-1 h-8 hidden sm:block" />

          <div>
            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Estimasi Profit ({daysCount}x ARA)</span>
            <span className="text-xl font-extrabold text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
              +{formatRupiah(lastDaySim.araPrice * lot * 100 - initialOrderValue)}
            </span>
            <span className="block text-[10px] text-emerald-500 font-bold">
              +{lastDaySim.cumulativePercentage.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tabel Proyeksi ARA Harian */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="glass-panel rounded-xl p-5 border border-white/5 overflow-x-auto max-h-[500px] overflow-y-auto">
            <h3 className="text-base font-bold text-white tracking-wide mb-4">
              Tabel Proyeksi ARA Berurutan ({daysCount} Hari Bursa)
            </h3>
            
            <table className="w-full text-left text-sm border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 font-semibold uppercase tracking-wider text-xs">
                  <th className="pb-3 pr-2">Hari</th>
                  <th className="pb-3 pr-4">Tanggal Bursa</th>
                  <th className="pb-3 text-center">Batas ARA</th>
                  <th className="pb-3 text-right">Harga Saham (Rp)</th>
                  <th className="pb-3 text-right">Nilai Portofolio</th>
                  <th className="pb-3 text-right text-emerald-400">Total Profit (PnL)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {simData.map((daySim, index) => {
                  const date = businessDays[index];
                  const formattedDate = date ? formatDateIndonesia(date) : '-';
                  const currentPortfolioValue = daySim.araPrice * lot * 100;
                  const profitNominal = currentPortfolioValue - initialOrderValue;

                  return (
                    <tr key={daySim.day} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 pr-2 font-bold text-violet-400">
                        Hari {daySim.day}
                      </td>
                      <td className="py-3.5 pr-4 text-xs text-gray-300 font-normal">
                        {formattedDate}
                      </td>
                      <td className="py-3.5 text-center text-xs text-emerald-500 font-bold">
                        +{daySim.dailyPercentage.toFixed(2)}%
                      </td>
                      <td className="py-3.5 text-right font-bold text-white">
                        {formatRupiah(daySim.araPrice)}
                      </td>
                      <td className="py-3.5 text-right font-semibold text-white">
                        {formatRupiah(currentPortfolioValue)}
                      </td>
                      <td className="py-3.5 text-right text-emerald-400">
                        <div className="font-bold">+{formatRupiah(profitNominal)}</div>
                        <div className="text-[10px] font-semibold text-emerald-500/80">
                          +{daySim.cumulativePercentage.toFixed(2)}%
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visualisasi Timeline Pertumbuhan Portofolio */}
        <div className="flex flex-col gap-4">
          <div className="glass-panel rounded-xl p-5 border border-white/5 flex flex-col justify-between max-h-[500px] overflow-y-auto">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide mb-4">
                Pertumbuhan Portofolio
              </h3>
              
              {/* Linimasa Progresif Visual */}
              <div className="flex flex-col gap-4 pl-2 relative border-l border-white/10 ml-2">
                {/* Modal Awal */}
                <div className="relative pl-6">
                  <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-violet-500 ring-4 ring-violet-500/20" />
                  <span className="block text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Harga IPO Awal</span>
                  <span className="text-sm font-semibold text-gray-300">{formatRupiah(initialOrderValue)}</span>
                </div>

                {simData.map((daySim, index) => {
                  const currentPortfolioValue = daySim.araPrice * lot * 100;
                  const isLast = index === simData.length - 1;

                  return (
                    <div key={daySim.day} className="relative pl-6">
                      <div className={`absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 transition-all ${
                        isLast 
                          ? 'bg-emerald-400 ring-emerald-400/30 w-3.5 h-3.5 left-[-7px] animate-pulse' 
                          : 'bg-emerald-500/60 ring-emerald-500/10'
                      }`} />
                      <span className="block text-[10px] text-gray-400 font-semibold">
                        Hari {daySim.day} ({daySim.dailyPercentage.toFixed(0)}% ARA)
                      </span>
                      <span className={`text-sm font-bold ${isLast ? 'text-emerald-400 text-base' : 'text-white'}`}>
                        {formatRupiah(currentPortfolioValue)}
                      </span>
                      <span className="inline-block text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded font-bold ml-2">
                        +{daySim.cumulativePercentage.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total Return Card */}
            <div className="mt-6 pt-4 border-t border-white/10 bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/10 flex-shrink-0">
              <span className="block text-[10px] text-emerald-400/80 font-bold uppercase tracking-wider">
                Estimasi Total Return ({daysCount}x ARA)
              </span>
              <span className="block text-2xl font-extrabold text-emerald-400 mt-1">
                +{formatRupiah(lastDaySim.araPrice * lot * 100 - initialOrderValue)}
              </span>
              <span className="text-xs text-gray-400">
                Nilai akhir: <strong className="text-white">{formatRupiah(lastDaySim.araPrice * lot * 100)}</strong>
              </span>
            </div>
            
          </div>
        </div>

      </div>
      
    </div>
  );
}
