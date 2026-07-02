import React from 'react';
import { calculateAraArb, formatRupiah } from '../utils/calculatorHelper';
import Tooltip from './Tooltip';

export default function IPOTable({ ipoList, orderLots, setOrderLots, selectedPrices, setSelectedPrices }) {
  
  const handleLotChange = (ticker, value) => {
    const cleanVal = value.replace(/\D/g, ''); // bersihkan non-angka
    const numVal = cleanVal ? parseInt(cleanVal, 10) : 0;
    setOrderLots(prev => ({
      ...prev,
      [ticker]: numVal
    }));
  };

  const handlePriceChange = (ticker, price) => {
    setSelectedPrices(prev => ({
      ...prev,
      [ticker]: price
    }));
  };

  return (
    <div className="hidden md:block w-full overflow-x-auto rounded-xl glass-panel p-1">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border-custom text-text-secondary font-semibold uppercase tracking-wider text-xs">
            <th className="py-4 px-5">Saham (Ticker)</th>
            <th className="py-4 px-4 text-center">Fase</th>
            <th className="py-4 px-4">Harga Acuan (Rp)</th>
            <th className="py-4 px-4 w-32 text-center">Jumlah Lot</th>
            <th className="py-4 px-4">Total Pesanan</th>
            <th className="py-4 px-4 border-l border-border-custom">
              <span className="flex items-center">
                Estimasi ARA (Batas Atas)
                <Tooltip content="Auto Rejection Atas: Batas kenaikan harga saham maksimal dalam satu hari perdagangan bursa." position="bottom" align="right" />
              </span>
            </th>
            <th className="py-4 px-4 border-l border-border-custom">
              <span className="flex items-center">
                Estimasi ARB (Batas Bawah)
                <Tooltip content="Auto Rejection Bawah: Batas penurunan harga saham maksimal dalam satu hari perdagangan bursa (minimal Rp50)." position="bottom" align="right" />
              </span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-custom font-medium">
          {ipoList.map((ipo) => {
            const lot = orderLots[ipo.ticker] || 0;
            
            // Jika Bookbuilding dan pengguna memilih harga dalam range, gunakan harga terpilih.
            // Default adalah harga tertinggi (max_price) untuk keamanan budgeting.
            const currentPrice = selectedPrices[ipo.ticker] !== undefined 
              ? selectedPrices[ipo.ticker] 
              : ipo.price;
              
            const totalOrder = currentPrice * lot * 100;
            
            const { araPrice, arbPrice, araPercentage, arbPercentage } = calculateAraArb(currentPrice);
            
            const araPortfolio = araPrice * lot * 100;
            const arbPortfolio = arbPrice * lot * 100;
            
            const araPnL = araPortfolio - totalOrder;
            const arbPnL = arbPortfolio - totalOrder;

            return (
              <tr key={ipo.ticker} className="hover:bg-white/[0.02] dark:hover:bg-white/[0.015] transition-colors group">
                {/* Ticker & Nama */}
                <td className="py-4 px-5">
                  <div className="font-bold text-text-primary text-base group-hover:text-accent-terracotta transition-colors">
                    {ipo.ticker}
                  </div>
                  <div className="text-xs text-text-secondary font-normal max-w-xs truncate">
                    {ipo.name}
                  </div>
                </td>
                
                {/* Fase */}
                <td className="py-4 px-4 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${
                    ipo.phase.toLowerCase() === 'offering'
                      ? 'bg-accent-terracotta/10 text-accent-terracotta border-accent-terracotta/20'
                      : 'bg-text-secondary/10 text-text-secondary border-text-secondary/20'
                  }`}>
                    {ipo.phase}
                  </span>
                </td>
                
                {/* Harga Acuan */}
                <td className="py-4 px-4">
                  {ipo.phase.toLowerCase() === 'bookbuilding' && ipo.min_price !== ipo.max_price ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-text-secondary font-normal font-mono">Range: {ipo.price_range}</span>
                      <select
                        className="bg-bg-primary border border-border-custom rounded px-2 py-1 text-text-primary text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent-terracotta"
                        value={currentPrice}
                        onChange={(e) => handlePriceChange(ipo.ticker, parseInt(e.target.value, 10))}
                      >
                        {Array.from(
                          { length: Math.floor((ipo.max_price - ipo.min_price) / 5) + 1 }, 
                          (_, i) => ipo.min_price + i * 5
                        ).filter(p => p <= ipo.max_price).concat(ipo.max_price).filter((v, i, self) => self.indexOf(v) === i)
                        .map((priceOption) => (
                          <option key={priceOption} value={priceOption} className="bg-bg-surface text-text-primary">
                            Rp {new Intl.NumberFormat("id-ID").format(priceOption)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="text-text-primary text-sm font-mono">
                      {formatRupiah(currentPrice)}
                    </div>
                  )}
                </td>
                
                {/* Lot Input */}
                <td className="py-4 px-4">
                  <input
                    type="text"
                    className="w-20 mx-auto block bg-bg-primary border border-border-custom rounded-lg py-1 px-2.5 text-text-primary text-center font-bold font-mono text-sm focus:outline-none focus:ring-1 focus:ring-accent-terracotta focus:border-transparent transition-all"
                    placeholder="0"
                    value={lot > 0 ? lot : ''}
                    onChange={(e) => handleLotChange(ipo.ticker, e.target.value)}
                  />
                </td>
                
                {/* Total Pesanan */}
                <td className="py-4 px-4 font-bold font-mono text-text-primary">
                  {formatRupiah(totalOrder)}
                </td>
                
                {/* Estimasi ARA */}
                <td className="py-4 px-4 border-l border-border-custom">
                  <div className="font-bold font-mono text-positive-ara">
                    {formatRupiah(araPrice)}
                  </div>
                  <div className="text-xs font-bold font-mono text-positive-ara/80">
                    +{araPercentage.toFixed(2)}%
                  </div>
                  {lot > 0 && (
                    <div className="mt-1 text-[10px] text-text-secondary font-normal leading-relaxed">
                      PnL: <span className="text-positive-ara font-bold font-mono">+{formatRupiah(araPnL)}</span>
                      <span className="block text-[9px] text-text-secondary/70 font-mono">Porto: {formatRupiah(araPortfolio)}</span>
                    </div>
                  )}
                </td>
                
                {/* Estimasi ARB */}
                <td className="py-4 px-4 border-l border-border-custom">
                  <div className="font-bold font-mono text-negative-arb">
                    {formatRupiah(arbPrice)}
                  </div>
                  <div className="text-xs font-bold font-mono text-negative-arb/80">
                    {arbPercentage.toFixed(2)}%
                  </div>
                  {lot > 0 && (
                    <div className="mt-1 text-[10px] text-text-secondary font-normal leading-relaxed">
                      PnL: <span className="text-negative-arb font-bold font-mono">{formatRupiah(arbPnL)}</span>
                      <span className="block text-[9px] text-text-secondary/70 font-mono">Porto: {formatRupiah(arbPortfolio)}</span>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
