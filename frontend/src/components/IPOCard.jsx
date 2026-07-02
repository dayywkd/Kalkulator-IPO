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
    <div className={`glass-panel rounded-xl overflow-hidden border transition-all ${
      lot > 0 ? 'border-l-2 border-l-[#B8860B] border-[#2A2A2A]' : 'border-[#2A2A2A]'
    }`}>
      {/* Bagian Atas Card (Selalu Terlihat) */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#EDEDED] text-base tracking-wide">{ipo.ticker}</span>
              <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border ${
                ipo.phase.toLowerCase() === 'offering'
                  ? 'bg-[#B8860B]/10 text-[#B8860B] border-[#B8860B]/20'
                  : 'bg-[#8A8A8F]/10 text-[#8A8A8F] border-[#8A8A8F]/20'
              }`}>
                {ipo.phase}
              </span>
            </div>
            <div className="text-xs text-[#8A8A8F] max-w-[180px] truncate mt-0.5">{ipo.name}</div>
          </div>
          
          <div className="text-right">
            <span className="block text-[9px] text-[#8A8A8F] uppercase tracking-wider font-semibold">Total Pesanan</span>
            <span className="text-sm font-bold font-mono text-[#EDEDED]">{formatRupiah(totalOrder)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 items-end mt-1">
          {/* Input Harga / Tampilan Harga */}
          <div>
            <label className="block text-[9px] text-[#8A8A8F] uppercase tracking-wider font-semibold mb-1">
              Harga Acuan
            </label>
            {ipo.phase.toLowerCase() === 'bookbuilding' && ipo.min_price !== ipo.max_price ? (
              <select
                className="w-full bg-[#0D0D0D]/50 border border-[#2A2A2A] rounded-lg px-2 py-1.5 text-[#EDEDED] text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
                value={currentPrice}
                onChange={(e) => handlePriceChange(parseInt(e.target.value, 10))}
              >
                {Array.from(
                  { length: Math.floor((ipo.max_price - ipo.min_price) / 5) + 1 },
                  (_, i) => ipo.min_price + i * 5
                ).filter(p => p <= ipo.max_price).concat(ipo.max_price).filter((v, i, self) => self.indexOf(v) === i)
                .map((priceOption) => (
                  <option key={priceOption} value={priceOption} className="bg-[#1A1A1A] text-[#EDEDED] font-mono">
                    Rp {new Intl.NumberFormat("id-ID").format(priceOption)}
                  </option>
                ))}
              </select>
            ) : (
              <span className="block text-[#EDEDED] font-bold font-mono text-sm py-1.5">
                {formatRupiah(currentPrice)}
              </span>
            )}
          </div>

          {/* Input Lot */}
          <div>
            <label className="block text-[9px] text-[#8A8A8F] uppercase tracking-wider font-semibold mb-1 text-right">
              Jumlah Lot
            </label>
            <input
              type="text"
              className="w-full bg-[#0D0D0D]/50 border border-[#2A2A2A] rounded-lg py-1 px-2.5 text-[#EDEDED] text-center font-bold font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#B8860B] focus:border-transparent transition-all"
              placeholder="0"
              value={lot > 0 ? lot : ''}
              onChange={(e) => handleLotChange(e.target.value)}
            />
          </div>
        </div>

        {/* Toggle Button Detail ARA/ARB */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full mt-2 py-1.5 px-4 rounded-lg bg-white/5 text-xs font-semibold text-[#B8860B] hover:bg-white/[0.02] border border-[#2A2A2A] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {isOpen ? 'Sembunyikan Estimasi ARA/ARB' : 'Lihat Estimasi ARA/ARB'}
          <svg
            className={`w-3 h-3 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Panel Accordion Detail (ARA/ARB) */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden bg-[#0D0D0D]/30 border-t border-[#2A2A2A] ${
          isOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-4 grid grid-cols-2 gap-3">
          {/* Proyeksi ARA */}
          <div className="bg-[#22C55E]/5 border border-[#22C55E]/10 rounded-lg p-2.5">
            <span className="block text-[9px] text-[#22C55E]/85 font-bold uppercase tracking-wider">Estimasi ARA</span>
            <span className="block text-base font-bold font-mono text-[#22C55E] mt-0.5">{formatRupiah(araPrice)}</span>
            <span className="inline-block text-[10px] bg-[#22C55E]/10 text-[#22C55E] px-1.5 py-0.2 rounded font-bold mt-1 font-mono">
              +{araPercentage.toFixed(2)}%
            </span>
            
            {lot > 0 && (
              <div className="mt-2.5 pt-2 border-t border-[#22C55E]/10 text-[9px] text-[#8A8A8F] leading-normal font-normal">
                <div>PnL: <span className="text-[#22C55E] font-bold font-mono">+{formatRupiah(araPnL)}</span></div>
                <div className="mt-0.5">Porto: <span className="text-[#EDEDED] font-mono">{formatRupiah(araPortfolio)}</span></div>
              </div>
            )}
          </div>

          {/* Proyeksi ARB */}
          <div className="bg-[#EF4444]/5 border border-[#EF4444]/10 rounded-lg p-2.5">
            <span className="block text-[9px] text-[#EF4444]/85 font-bold uppercase tracking-wider">Estimasi ARB</span>
            <span className="block text-base font-bold font-mono text-[#EF4444] mt-0.5">{formatRupiah(arbPrice)}</span>
            <span className="inline-block text-[10px] bg-[#EF4444]/10 text-[#EF4444] px-1.5 py-0.2 rounded font-bold mt-1 font-mono">
              {arbPercentage.toFixed(2)}%
            </span>
            
            {lot > 0 && (
              <div className="mt-2.5 pt-2 border-t border-[#EF4444]/10 text-[9px] text-[#8A8A8F] leading-normal font-normal">
                <div>PnL: <span className="text-[#EF4444] font-bold font-mono">{formatRupiah(arbPnL)}</span></div>
                <div className="mt-0.5">Porto: <span className="text-[#EDEDED] font-mono">{formatRupiah(arbPortfolio)}</span></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
