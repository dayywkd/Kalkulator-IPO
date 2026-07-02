import React from 'react';
import { formatRupiah } from '../utils/calculatorHelper';

const COLORS = [
  '#a78bfa', // violet-400
  '#60a5fa', // blue-400
  '#2dd4bf', // teal-400
  '#34d399', // emerald-400
  '#fbbf24', // amber-400
  '#f43f5e'  // rose-500
];

export default function AllocationChart({ ipoList, orderLots, selectedPrices, totalOrder, capital }) {
  // Ambil emiten dengan pesanan aktif (lot > 0)
  const activeOrders = ipoList.filter(ipo => (orderLots[ipo.ticker] || 0) > 0);
  
  if (activeOrders.length === 0 || totalOrder === 0) {
    return (
      <div className="glass-panel rounded-xl p-5 border border-white/5 flex flex-col items-center justify-center text-center h-full min-h-[180px]">
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center text-gray-500 font-bold mb-2">
          %
        </div>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Alokasi Dana</span>
        <span className="text-xs text-gray-500 mt-1 max-w-[180px]">Masukkan jumlah lot pesanan untuk melihat distribusi dana.</span>
      </div>
    );
  }

  // Hitung persentase alokasi dana per emiten
  let cumulativePercentage = 0;
  const items = activeOrders.map((ipo, idx) => {
    const lot = orderLots[ipo.ticker] || 0;
    const price = selectedPrices[ipo.ticker] !== undefined ? selectedPrices[ipo.ticker] : ipo.price;
    const value = price * lot * 100;
    const percentage = (value / totalOrder) * 100;
    
    const start = cumulativePercentage;
    cumulativePercentage += percentage;
    const end = cumulativePercentage;
    
    return {
      ticker: ipo.ticker,
      value,
      percentage,
      color: COLORS[idx % COLORS.length],
      start,
      end
    };
  });

  // Buat string conic-gradient
  const gradientString = items
    .map(item => `${item.color} ${item.start.toFixed(2)}% ${item.end.toFixed(2)}%`)
    .join(', ');

  const donutStyle = {
    background: `conic-gradient(${gradientString})`
  };

  const usedCapitalPercentage = capital > 0 ? (totalOrder / capital) * 100 : 0;

  return (
    <div className="glass-panel rounded-xl p-5 border border-white/5 flex flex-col md:flex-row items-center gap-6 h-full shadow-md">
      
      {/* Visual Donut Chart */}
      <div className="relative w-28 h-28 flex-shrink-0 rounded-full flex items-center justify-center" style={donutStyle}>
        {/* Lubang Tengah Donut */}
        <div className="w-[74px] h-[74px] bg-[#0c0e14] rounded-full flex flex-col items-center justify-center text-center shadow-inner">
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Terpakai</span>
          <span className="text-sm font-extrabold text-white">
            {usedCapitalPercentage.toFixed(0)}%
          </span>
          <span className="text-[8px] text-gray-500">dari modal</span>
        </div>
      </div>

      {/* Legenda Emiten */}
      <div className="flex-1 w-full flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 hidden md:block">
          Distribusi Modal
        </h4>
        {items.map(item => (
          <div key={item.ticker} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="font-bold text-white tracking-wide">{item.ticker}</span>
            </div>
            <div className="text-right">
              <span className="font-semibold text-gray-300">{item.percentage.toFixed(1)}%</span>
              <span className="block text-[9px] text-gray-500 font-normal">{formatRupiah(item.value)}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
