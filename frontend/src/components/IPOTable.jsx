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
          <tr className="border-b border-[#2A2A2A] text-[#8A8A8F] font-semibold uppercase tracking-wider text-xs">
            <th className="py-4 px-5">Saham (Ticker)</th>
            <th className="py-4 px-4 text-center">Fase</th>
            <th className="py-4 px-4">Harga Acuan (Rp)</th>
            <th className="py-4 px-4 w-32 text-center">Jumlah Lot</th>
            <th className="py-4 px-4">Total Pesanan</th>
            <th className="py-4 px-4 border-l border-[#2A2A2A]">
              <span className="flex items-center">
                Estimasi ARA (Batas Atas)
                <Tooltip content="Auto Rejection Atas: Batas kenaikan harga saham maksimal dalam satu hari perdagangan bursa." position="bottom" align="right" />
              </span>
            </th>
            <th className="py-4 px-4 border-l border-[#2A2A2A]">
              <span className="flex items-center">
                Estimasi ARB (Batas Bawah)
                <Tooltip content="Auto Rejection Bawah: Batas penurunan harga saham maksimal dalam satu hari perdagangan bursa (minimal Rp50)." position="bottom" align="right" />
              </span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2A2A2A] font-medium">
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
              <tr key={ipo.ticker} className="hover:bg-white/[0.015] transition-colors group">
                {/* Ticker & Nama */}
                <td className="py-4 px-5">
                  <div className="font-bold text-[#EDEDED] text-base group-hover:text-[#B8860B] transition-colors">
                    {ipo.ticker}
                  </div>
                  <div className="text-xs text-[#8A8A8F] font-normal max-w-xs truncate">
                    {ipo.name}
                  </div>
                </td>
                
                {/* Fase */}
                <td className="py-4 px-4 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${
                    ipo.phase.toLowerCase() === 'offering'
                      ? 'bg-[#B8860B]/10 text-[#B8860B] border-[#B8860B]/20'
                      : 'bg-[#8A8A8F]/10 text-[#8A8A8F] border-[#8A8A8F]/20'
                  }`}>
                    {ipo.phase}
                  </span>
                </td>
                
                {/* Harga Acuan */}
                <td className="py-4 px-4">
                  {ipo.phase.toLowerCase() === 'bookbuilding' && ipo.min_price !== ipo.max_price ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-[#8A8A8F] font-normal font-mono">Range: {ipo.price_range}</span>
                      <select
                        className="bg-[#0D0D0D]/50 border border-[#2A2A2A] rounded px-2 py-1 text-[#EDEDED] text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
                        value={currentPrice}
                        onChange={(e) => handlePriceChange(ipo.ticker, parseInt(e.target.value, 10))}
                      >
                        {Array.from(
                          { length: Math.floor((ipo.max_price - ipo.min_price) / 5) + 1 }, 
                          (_, i) => ipo.min_price + i * 5
                        ).filter(p => p <= ipo.max_price).concat(ipo.max_price).filter((v, i, self) => self.indexOf(v) === i)
                        .map((priceOption) => (
                          <option key={priceOption} value={priceOption} className="bg-[#1A1A1A] text-[#EDEDED]">
                            Rp {new Intl.NumberFormat("id-ID").format(priceOption)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="text-[#EDEDED] text-sm font-mono">
                      {formatRupiah(currentPrice)}
                    </div>
                  )}
                </td>
                
                {/* Lot Input */}
                <td className="py-4 px-4">
                  <input
                    type="text"
                    className="w-20 mx-auto block bg-[#0D0D0D]/50 border border-[#2A2A2A] rounded-lg py-1 px-2.5 text-[#EDEDED] text-center font-bold font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B] focus:border-transparent transition-all"
                    placeholder="0"
                    value={lot > 0 ? lot : ''}
                    onChange={(e) => handleLotChange(ipo.ticker, e.target.value)}
                  />
                </td>
                
                {/* Total Pesanan */}
                <td className="py-4 px-4 font-bold font-mono text-[#EDEDED]">
                  {formatRupiah(totalOrder)}
                </td>
                
                {/* Estimasi ARA */}
                <td className="py-4 px-4 border-l border-[#2A2A2A]">
                  <div className="font-bold font-mono text-[#22C55E]">
                    {formatRupiah(araPrice)}
                  </div>
                  <div className="text-xs font-bold font-mono text-[#22C55E]/80">
                    +{araPercentage.toFixed(2)}%
                  </div>
                  {lot > 0 && (
                    <div className="mt-1 text-[10px] text-[#8A8A8F] font-normal leading-relaxed">
                      PnL: <span className="text-[#22C55E] font-bold font-mono">+{formatRupiah(araPnL)}</span>
                      <span className="block text-[9px] text-[#8A8A8F]/70 font-mono">Porto: {formatRupiah(araPortfolio)}</span>
                    </div>
                  )}
                </td>
                
                {/* Estimasi ARB */}
                <td className="py-4 px-4 border-l border-[#2A2A2A]">
                  <div className="font-bold font-mono text-[#EF4444]">
                    {formatRupiah(arbPrice)}
                  </div>
                  <div className="text-xs font-bold font-mono text-[#EF4444]/80">
                    {arbPercentage.toFixed(2)}%
                  </div>
                  {lot > 0 && (
                    <div className="mt-1 text-[10px] text-[#8A8A8F] font-normal leading-relaxed">
                      PnL: <span className="text-[#EF4444] font-bold font-mono">{formatRupiah(arbPnL)}</span>
                      <span className="block text-[9px] text-[#8A8A8F]/70 font-mono">Porto: {formatRupiah(arbPortfolio)}</span>
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
