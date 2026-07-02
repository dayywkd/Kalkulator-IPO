import React, { useState } from 'react';
import { calculateAraArb, formatRupiah } from '../utils/calculatorHelper';

export default function IPOCard({ ipoList, orderLots, setOrderLots, selectedPrices, setSelectedPrices }) {
  return (
    <div className="md:hidden flex flex-col gap-4 w-full px-1">
      {ipoList.map((ipo) => (
        <SingleIPOCard
          key={ipo.ticker}
          ipo={ipo}
          lot={orderLots[ipo.ticker] || 0}
          setOrderLots={setOrderLots}
          currentPrice={selectedPrices[ipo.ticker] !== undefined ? selectedPrices[ipo.ticker] : ipo.price}
          setSelectedPrices={setSelectedPrices}
        />
      ))}
    </div>
  );
}

function SingleIPOCard({ ipo, lot, setOrderLots, currentPrice, setSelectedPrices }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLotChange = (value) => {
    const cleanVal = value.replace(/\D/g, ''); // bersihkan non-angka
    const numVal = cleanVal ? parseInt(cleanVal, 10) : 0;
    setOrderLots(prev => ({
      ...prev,
      [ipo.ticker]: numVal
    }));
  };

  const handlePriceChange = (price) => {
    setSelectedPrices(prev => ({
      ...prev,
      [ipo.ticker]: price
    }));
  };

  const totalOrder = currentPrice * lot * 100;
  
  const { araPrice, arbPrice, araPercentage, arbPercentage } = calculateAraArb(currentPrice);
  
  const araPortfolio = araPrice * lot * 100;
  const arbPortfolio = arbPrice * lot * 100;
  
  const araPnL = araPortfolio - totalOrder;
  const arbPnL = arbPortfolio - totalOrder;

  return (
    <div className="glass-panel rounded-xl overflow-hidden shadow-md border border-white/5 transition-all">
      {/* Bagian Atas Card (Selalu Terlihat) */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-lg tracking-wide">{ipo.ticker}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                ipo.phase.toLowerCase() === 'offering'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              }`}>
                {ipo.phase}
              </span>
            </div>
            <div className="text-xs text-gray-400 max-w-[200px] truncate mt-0.5">{ipo.name}</div>
          </div>
          
          <div className="text-right">
            <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Total Pesanan</span>
            <span className="text-base font-bold text-white">{formatRupiah(totalOrder)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 items-end mt-1">
          {/* Input Harga / Tampilan Harga */}
          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
              Harga Acuan
            </label>
            {ipo.phase.toLowerCase() === 'bookbuilding' && ipo.min_price !== ipo.max_price ? (
              <select
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                value={currentPrice}
                onChange={(e) => handlePriceChange(parseInt(e.target.value, 10))}
              >
                {Array.from(
                  { length: Math.floor((ipo.max_price - ipo.min_price) / 5) + 1 },
                  (_, i) => ipo.min_price + i * 5
                ).filter(p => p <= ipo.max_price).concat(ipo.max_price).filter((v, i, self) => self.indexOf(v) === i)
                .map((priceOption) => (
                  <option key={priceOption} value={priceOption} className="bg-slate-900 text-white">
                    Rp {new Intl.NumberFormat("id-ID").format(priceOption)}
                  </option>
                ))}
              </select>
            ) : (
              <span className="block text-white font-bold text-base py-1">
                {formatRupiah(currentPrice)}
              </span>
            )}
          </div>

          {/* Input Lot */}
          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1 text-right">
              Jumlah Lot
            </label>
            <input
              type="text"
              className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-white text-center font-bold focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              placeholder="0"
              value={lot > 0 ? lot : ''}
              onChange={(e) => handleLotChange(e.target.value)}
            />
          </div>
        </div>

        {/* Toggle Button Detail ARA/ARB */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full mt-2 py-2 px-4 rounded-lg bg-white/5 text-xs font-semibold text-violet-300 hover:bg-white/10 border border-violet-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
        >
          {isOpen ? 'Sembunyikan Estimasi ARA/ARB' : 'Lihat Estimasi ARA/ARB'}
          <svg
            className={`w-3.5 h-3.5 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Panel Accordion Detail (ARA/ARB) */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden bg-black/20 border-t border-white/5 ${
          isOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-4 grid grid-cols-2 gap-4">
          {/* Proyeksi ARA */}
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
            <span className="block text-[10px] text-emerald-400/80 font-bold uppercase tracking-wider">Estimasi ARA</span>
            <span className="block text-lg font-bold text-emerald-400 mt-1">{formatRupiah(araPrice)}</span>
            <span className="inline-block text-xs bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-semibold mt-0.5">
              +{araPercentage.toFixed(2)}%
            </span>
            
            {lot > 0 && (
              <div className="mt-3 pt-2 border-t border-emerald-500/10 text-[10px] text-gray-400">
                <div>PnL: <span className="text-emerald-400 font-bold">+{formatRupiah(araPnL)}</span></div>
                <div className="mt-0.5">Portofolio: <span className="text-white font-medium">{formatRupiah(araPortfolio)}</span></div>
              </div>
            )}
          </div>

          {/* Proyeksi ARB */}
          <div className="bg-rose-500/5 border border-rose-500/10 rounded-lg p-3">
            <span className="block text-[10px] text-rose-400/80 font-bold uppercase tracking-wider">Estimasi ARB</span>
            <span className="block text-lg font-bold text-rose-400 mt-1">{formatRupiah(arbPrice)}</span>
            <span className="inline-block text-xs bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded font-semibold mt-0.5">
              {arbPercentage.toFixed(2)}%
            </span>
            
            {lot > 0 && (
              <div className="mt-3 pt-2 border-t border-rose-500/10 text-[10px] text-gray-400">
                <div>PnL: <span className="text-rose-400 font-bold">{formatRupiah(arbPnL)}</span></div>
                <div className="mt-0.5">Portofolio: <span className="text-white font-medium">{formatRupiah(arbPortfolio)}</span></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
