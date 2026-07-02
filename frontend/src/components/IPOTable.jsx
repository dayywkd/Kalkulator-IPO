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
          <tr className="border-b border-white/10 text-gray-400 font-semibold uppercase tracking-wider text-xs">
            <th className="py-4 px-5">Saham (Ticker)</th>
            <th className="py-4 px-4 text-center">Fase</th>
            <th className="py-4 px-4">Harga Acuan (Rp)</th>
            <th className="py-4 px-4 w-32">Jumlah Lot</th>
            <th className="py-4 px-4">Total Pesanan</th>
            <th className="py-4 px-4 bg-emerald-500/5 text-emerald-400 border-l border-white/5">
              <span className="flex items-center">
                Estimasi ARA (Batas Atas)
                <Tooltip content="Auto Rejection Atas: Batas kenaikan harga saham maksimal dalam satu hari perdagangan bursa." position="bottom" align="right" />
              </span>
            </th>
            <th className="py-4 px-4 bg-rose-500/5 text-rose-400 border-l border-white/5">
              <span className="flex items-center">
                Estimasi ARB (Batas Bawah)
                <Tooltip content="Auto Rejection Bawah: Batas penurunan harga saham maksimal dalam satu hari perdagangan bursa (minimal Rp50)." position="bottom" align="right" />
              </span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 font-medium">
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
              <tr key={ipo.ticker} className="hover:bg-white/5 transition-colors group">
                {/* Ticker & Nama */}
                <td className="py-4 px-5">
                  <div className="font-bold text-white text-base group-hover:text-violet-400 transition-colors">
                    {ipo.ticker}
                  </div>
                  <div className="text-xs text-gray-400 font-normal max-w-xs truncate">
                    {ipo.name}
                  </div>
                </td>
                
                {/* Fase */}
                <td className="py-4 px-4 text-center">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${
                    ipo.phase.toLowerCase() === 'offering'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {ipo.phase}
                  </span>
                </td>
                
                {/* Harga Acuan */}
                <td className="py-4 px-4">
                  {ipo.phase.toLowerCase() === 'bookbuilding' && ipo.min_price !== ipo.max_price ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-400 font-normal">Range: {ipo.price_range}</span>
                      <select
                        className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                        value={currentPrice}
                        onChange={(e) => handlePriceChange(ipo.ticker, parseInt(e.target.value, 10))}
                      >
                        {/* Buat pilihan dari min_price ke max_price dengan kelipatan fraksi */}
                        {Array.from(
                          { length: Math.floor((ipo.max_price - ipo.min_price) / 5) + 1 }, // default step Rp5 untuk penawaran
                          (_, i) => ipo.min_price + i * 5
                        ).filter(p => p <= ipo.max_price).concat(ipo.max_price).filter((v, i, self) => self.indexOf(v) === i)
                        .map((priceOption) => (
                          <option key={priceOption} value={priceOption} className="bg-slate-900 text-white">
                            Rp {new Intl.NumberFormat("id-ID").format(priceOption)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="text-white text-base">
                      {formatRupiah(currentPrice)}
                    </div>
                  )}
                </td>
                
                {/* Lot Input */}
                <td className="py-4 px-4">
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-white text-center font-bold focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    placeholder="0"
                    value={lot > 0 ? lot : ''}
                    onChange={(e) => handleLotChange(ipo.ticker, e.target.value)}
                  />
                </td>
                
                {/* Total Pesanan */}
                <td className="py-4 px-4 font-semibold text-white">
                  {formatRupiah(totalOrder)}
                </td>
                
                {/* Estimasi ARA */}
                <td className="py-4 px-4 bg-emerald-500/5 border-l border-white/5 text-emerald-400">
                  <div className="font-bold text-base">
                    {formatRupiah(araPrice)}
                  </div>
                  <div className="text-xs font-semibold text-emerald-500/80">
                    +{araPercentage.toFixed(2)}%
                  </div>
                  {lot > 0 && (
                    <div className="mt-1 text-xs text-gray-400 font-normal">
                      PnL: <span className="text-emerald-400 font-semibold">+{formatRupiah(araPnL)}</span>
                      <span className="block text-[10px] text-gray-500">Porto: {formatRupiah(araPortfolio)}</span>
                    </div>
                  )}
                </td>
                
                {/* Estimasi ARB */}
                <td className="py-4 px-4 bg-rose-500/5 border-l border-white/5 text-rose-400">
                  <div className="font-bold text-base">
                    {formatRupiah(arbPrice)}
                  </div>
                  <div className="text-xs font-semibold text-rose-500/80">
                    {arbPercentage.toFixed(2)}%
                  </div>
                  {lot > 0 && (
                    <div className="mt-1 text-xs text-gray-400 font-normal">
                      PnL: <span className="text-rose-400 font-semibold">{formatRupiah(arbPnL)}</span>
                      <span className="block text-[10px] text-gray-500">Porto: {formatRupiah(arbPortfolio)}</span>
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
