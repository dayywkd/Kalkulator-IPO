import React from 'react';
import { formatRupiah } from '../utils/calculatorHelper';
import Tooltip from './Tooltip';

export default function CapitalHeader({ capital, setCapital, totalOrder }) {
  const remaining = capital - totalOrder;
  const isOverBudget = remaining < 0;
  const usedPercentage = capital > 0 ? Math.min(100, (totalOrder / capital) * 100) : 0;

  // Handler input modal agar otomatis memformat ribuan dan hanya menerima angka
  const handleCapitalChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, ''); // bersihkan non-angka
    const numVal = rawVal ? parseInt(rawVal, 10) : 0;
    setCapital(numVal);
  };

  return (
    <div className="sticky top-0 z-40 w-full glass-panel border-b border-border-custom py-4 px-6 md:px-8 mb-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Input Modal */}
        <div className="flex-1 max-w-sm">
          <label htmlFor="capital-input" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1 flex items-center">
            Total Alokasi Modal (Dana Tunai)
            <Tooltip content="Dana tunai maksimal yang ingin Anda alokasikan untuk berburu pesanan saham IPO pada periode ini." position="bottom" />
          </label>
          <div className="relative rounded-lg shadow-sm">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-secondary font-semibold text-sm">
              Rp
            </span>
            <input
              id="capital-input"
              type="text"
              className="w-full bg-bg-primary border border-border-custom rounded-lg py-2 pl-10 pr-4 text-text-primary font-bold font-mono text-base focus:outline-none focus:ring-1 focus:ring-accent-terracotta focus:border-transparent transition-all"
              placeholder="0"
              value={capital > 0 ? new Intl.NumberFormat("id-ID").format(capital) : ''}
              onChange={handleCapitalChange}
            />
          </div>
        </div>

        {/* Metrik Info */}
        <div className="flex flex-wrap items-center gap-6 md:gap-10">
          {/* Total Pesanan */}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1 flex items-center">
              Total Pesanan
              <Tooltip content="Total akumulasi nilai pembelian dari semua saham IPO yang Anda pesan (Harga Saham * Lot * 100)." position="bottom" />
            </span>
            <span className="text-lg font-bold font-mono text-text-primary">
              {formatRupiah(totalOrder)}
            </span>
          </div>

          {/* Sisa Saldo */}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1 flex items-center">
              Sisa Saldo
              <Tooltip content="Selisih antara modal awal Anda dengan total pesanan aktif. Nilai akan berwarna merah berkedip jika Anda mengalami over-budget." position="bottom" />
            </span>
            <span className={`text-lg font-bold font-mono transition-colors duration-300 ${
              isOverBudget 
                ? 'text-negative-arb font-extrabold animate-pulse' 
                : 'text-positive-ara'
            }`}>
              {formatRupiah(remaining)}
            </span>
          </div>

          {/* Progress Alokasi */}
          <div className="w-full sm:w-48">
            <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
              <span className="flex items-center">
                Dana Teralokasi
                <Tooltip content="Persentase modal awal Anda yang telah habis digunakan untuk membiayai pesanan saham IPO aktif." position="bottom" />
              </span>
              <span className={`font-mono font-bold ${isOverBudget ? 'text-negative-arb' : 'text-accent-terracotta'}`}>
                {usedPercentage.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-bg-primary border border-border-custom rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isOverBudget ? 'bg-negative-arb' : 'bg-accent-terracotta'
                }`}
                style={{ width: `${usedPercentage}%` }}
              />
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Alarm Peringatan Over Budget */}
      {isOverBudget && (
        <div className="max-w-7xl mx-auto mt-2 text-center text-xs font-semibold text-negative-arb bg-negative-arb/10 border border-negative-arb/20 py-1.5 px-3 rounded-md animate-bounce">
          ⚠️ Peringatan: Total pesanan Anda melebihi modal yang dialokasikan!
        </div>
      )}
    </div>
  );
}
