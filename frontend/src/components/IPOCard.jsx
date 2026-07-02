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
      lot > 0 ? 'border-l-2 border-l-accent-terracotta border-border-custom' : 'border-border-custom'
    }`}>
      {/* Bagian Atas Card (Selalu Terlihat) */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-text-primary text-base tracking-wide">{ipo.ticker}</span>
              <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border ${
                ipo.phase.toLowerCase() === 'offering'
                  ? 'bg-accent-terracotta/10 text-accent-terracotta border-accent-terracotta/20'
                  : 'bg-text-secondary/10 text-text-secondary border-text-secondary/20'
              }`}>
                {ipo.phase}
              </span>
            </div>
            <div className="text-xs text-text-secondary max-w-[180px] truncate mt-0.5">{ipo.name}</div>
          </div>
          
          <div className="text-right">
            <span className="block text-[9px] text-text-secondary uppercase tracking-wider font-semibold">Total Pesanan</span>
            <span className="text-sm font-bold font-mono text-text-primary">{formatRupiah(totalOrder)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 items-end mt-1">
          {/* Input Harga / Tampilan Harga */}
          <div>
            <label className="block text-[9px] text-text-secondary uppercase tracking-wider font-semibold mb-1">
              Harga Acuan
            </label>
            {ipo.phase.toLowerCase() === 'bookbuilding' && ipo.min_price !== ipo.max_price ? (
              <select
                className="w-full bg-bg-primary border border-border-custom rounded-lg px-2 py-1.5 text-text-primary text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent-terracotta"
                value={currentPrice}
                onChange={(e) => handlePriceChange(parseInt(e.target.value, 10))}
              >
                {Array.from(
                  { length: Math.floor((ipo.max_price - ipo.min_price) / 5) + 1 },
                  (_, i) => ipo.min_price + i * 5
                ).filter(p => p <= ipo.max_price).concat(ipo.max_price).filter((v, i, self) => self.indexOf(v) === i)
                .map((priceOption) => (
                  <option key={priceOption} value={priceOption} className="bg-bg-surface text-text-primary font-mono">
                    Rp {new Intl.NumberFormat("id-ID").format(priceOption)}
                  </option>
                ))}
              </select>
            ) : (
              <span className="block text-text-primary font-bold font-mono text-sm py-1.5">
                {formatRupiah(currentPrice)}
              </span>
            )}
          </div>

          {/* Input Lot */}
          <div>
            <label className="block text-[9px] text-text-secondary uppercase tracking-wider font-semibold mb-1 text-right">
              Jumlah Lot
            </label>
            <input
              type="text"
              className="w-full bg-bg-primary border border-border-custom rounded-lg py-1 px-2.5 text-text-primary text-center font-bold font-mono text-xs focus:outline-none focus:ring-1 focus:ring-accent-terracotta focus:border-transparent transition-all"
              placeholder="0"
              value={lot > 0 ? lot : ''}
              onChange={(e) => handleLotChange(e.target.value)}
            />
          </div>
        </div>

        {/* Toggle Button Detail ARA/ARB */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full mt-2 py-1.5 px-4 rounded-lg bg-white/5 text-xs font-semibold text-accent-terracotta hover:bg-white/[0.02] border border-border-custom active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
        className={`transition-all duration-300 ease-in-out overflow-hidden bg-bg-primary/30 border-t border-border-custom ${
          isOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-4 grid grid-cols-2 gap-3">
          {/* Proyeksi ARA */}
          <div className="bg-positive-ara/5 border border-positive-ara/10 rounded-lg p-2.5">
            <span className="block text-[9px] text-positive-ara/85 font-bold uppercase tracking-wider">Estimasi ARA</span>
            <span className="block text-base font-bold font-mono text-positive-ara mt-0.5">{formatRupiah(araPrice)}</span>
            <span className="inline-block text-[10px] bg-positive-ara/10 text-positive-ara px-1.5 py-0.2 rounded font-bold mt-1 font-mono">
              +{araPercentage.toFixed(2)}%
            </span>
            
            {lot > 0 && (
              <div className="mt-2.5 pt-2 border-t border-positive-ara/10 text-[9px] text-text-secondary leading-normal font-normal">
                <div>PnL: <span className="text-positive-ara font-bold font-mono">+{formatRupiah(araPnL)}</span></div>
                <div>Porto: <span className="text-text-primary font-mono">{formatRupiah(araPortfolio)}</span></div>
              </div>
            )}
          </div>

          {/* Proyeksi ARB */}
          <div className="bg-negative-arb/5 border border-negative-arb/10 rounded-lg p-2.5">
            <span className="block text-[9px] text-negative-arb/85 font-bold uppercase tracking-wider">Estimasi ARB</span>
            <span className="block text-base font-bold font-mono text-negative-arb mt-0.5">{formatRupiah(arbPrice)}</span>
            <span className="inline-block text-[10px] bg-negative-arb/10 text-negative-arb px-1.5 py-0.2 rounded font-bold mt-1 font-mono">
              {arbPercentage.toFixed(2)}%
            </span>
            
            {lot > 0 && (
              <div className="mt-2.5 pt-2 border-t border-negative-arb/10 text-[9px] text-text-secondary leading-normal font-normal">
                <div>PnL: <span className="text-negative-arb font-bold font-mono">{formatRupiah(arbPnL)}</span></div>
                <div>Porto: <span className="text-text-primary font-mono">{formatRupiah(arbPortfolio)}</span></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
