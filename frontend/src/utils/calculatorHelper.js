/**
 * Utilitas Kalkulasi Auto Rejection ARA/ARB & Fraksi Harga Bursa Efek Indonesia (IDX).
 */

/**
 * Mendapatkan persentase Auto Rejection berdasarkan harga acuan (harga IPO).
 * Aturan Simetris IDX:
 * - Rp50 s.d. Rp200 : 35%
 * - >Rp200 s.d. Rp5.000 : 25%
 * - >Rp5.000 : 20%
 * 
 * @param {number} price Harga acuan saham
 * @returns {number} Persentase batas (dalam desimal, misal 0.35)
 */
export function getAutoRejectionPercentage(price) {
  if (price <= 200) {
    return 0.35;
  } else if (price <= 5000) {
    return 0.25;
  } else {
    return 0.20;
  }
}

/**
 * Mendapatkan fraksi harga (tick size) berdasarkan tingkat harga saat ini.
 * Aturan IDX:
 * - < Rp200 : Rp1 (maks perubahan Rp10)
 * - Rp200 s.d. < Rp500 : Rp2 (maks perubahan Rp20)
 * - Rp500 s.d. < Rp2.000 : Rp5 (maks perubahan Rp50)
 * - Rp2.000 s.d. < Rp5.000 : Rp10 (maks perubahan Rp100)
 * - >= Rp5.000 : Rp25 (maks perubahan Rp250)
 * 
 * @param {number} price Harga saham saat ini
 * @returns {number} Fraksi harga (tick size)
 */
export function getTickSize(price) {
  if (price < 200) {
    return 1;
  } else if (price < 500) {
    return 2;
  } else if (price < 2000) {
    return 5;
  } else if (price < 5000) {
    return 10;
  } else {
    return 25;
  }
}

/**
 * Menghitung Harga ARA dan ARB dengan presisi fraksi harga IDX.
 * 
 * Aturan Pembulatan:
 * - ARA (Batas Atas): Dibulatkan ke BAWAH (Math.floor) ke kelipatan fraksi harga terdekat
 *   agar kenaikan aktual tidak melampaui persentase maksimum bursa.
 * - ARB (Batas Bawah): Dibulatkan ke ATAS (Math.ceil) ke kelipatan fraksi harga terdekat
 *   agar penurunan aktual tidak melampaui persentase maksimum bursa.
 * - Harga saham terendah di pasar reguler Indonesia adalah Rp50.
 * 
 * @param {number} price Harga acuan saham (IPO)
 * @returns {object} Objek berisi detail harga ARA/ARB dan persentase perubahan aktualnya.
 */
export function calculateAraArb(price) {
  if (!price || price <= 0) {
    return { araPrice: 0, arbPrice: 0, araPercentage: 0, arbPercentage: 0 };
  }

  const limitPercentage = getAutoRejectionPercentage(price);

  // --- Perhitungan ARA ---
  const rawAra = price * (1 + limitPercentage);
  const araTick = getTickSize(rawAra);
  const araPrice = Math.floor(rawAra / araTick) * araTick;
  const araPercentage = ((araPrice - price) / price) * 100;

  // --- Perhitungan ARB ---
  const rawArb = price * (1 - limitPercentage);
  const arbTick = getTickSize(rawArb);
  let arbPrice = Math.ceil(rawArb / arbTick) * arbTick;
  
  // Batas bawah gocap (Rp50)
  if (arbPrice < 50) {
    arbPrice = 50;
  }
  const arbPercentage = ((arbPrice - price) / price) * 100;

  return {
    araPrice,
    arbPrice,
    araPercentage,
    arbPercentage
  };
}

/**
 * Memformat angka nominal menjadi mata uang Rupiah yang rapi (id-ID).
 * Contoh: 1000000 -> Rp 1.000.000
 * 
 * @param {number} value Angka nominal
 * @param {boolean} includeSymbol Apakah menyertakan teks 'Rp' di depan
 * @returns {string} String terformat Rupiah
 */
export function formatRupiah(value, includeSymbol = true) {
  if (value === undefined || value === null || isNaN(value)) {
    return includeSymbol ? "Rp 0" : "0";
  }
  const formatted = new Intl.NumberFormat("id-ID").format(value);
  return includeSymbol ? `Rp ${formatted}` : formatted;
}

/**
 * Mendapatkan daftar tanggal hari bursa berikutnya (Senin-Jumat) dari tanggal mulai.
 * 
 * @param {string} startDateStr Tanggal mulai (YYYY-MM-DD)
 * @param {number} numDays Jumlah hari kerja bursa yang diinginkan
 * @returns {Date[]} Array berisi objek Date hari bursa
 */
export function getNextBusinessDays(startDateStr, numDays = 5) {
  const dates = [];
  let current = new Date(startDateStr);
  
  if (isNaN(current.getTime())) {
    current = new Date();
  }

  while (dates.length < numDays) {
    const dayOfWeek = current.getDay();
    // 0 = Minggu, 6 = Sabtu. Hanya skip Sabtu & Minggu
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/**
 * Memformat tanggal ke string format lokal Indonesia (contoh: Selasa, 07 Juli 2026).
 * 
 * @param {Date} date Objek Date
 * @returns {string} String tanggal terformat
 */
export function formatDateIndonesia(date) {
  const options = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
  return new Intl.DateTimeFormat('id-ID', options).format(date);
}

/**
 * Mensimulasikan kenaikan harga saham jika ARA berturut-turut selama beberapa hari.
 * Mengikuti fraksi harga IDX pada setiap hari kenaikan.
 * 
 * @param {number} startPrice Harga acuan awal (IPO)
 * @param {number} numDays Jumlah hari simulasi (default 5 hari)
 * @returns {Array} Array objek detail simulasi per hari
 */
export function simulateSequentialAra(startPrice, numDays = 5) {
  const simulation = [];
  let currentPrice = startPrice;

  for (let i = 1; i <= numDays; i++) {
    const limitPercentage = getAutoRejectionPercentage(currentPrice);
    const rawAra = currentPrice * (1 + limitPercentage);
    const tick = getTickSize(rawAra);
    const araPrice = Math.floor(rawAra / tick) * tick;
    const dailyChangePercentage = ((araPrice - currentPrice) / currentPrice) * 100;
    const cumulativeChangePercentage = ((araPrice - startPrice) / startPrice) * 100;

    simulation.push({
      day: i,
      startPrice: currentPrice,
      araPrice: araPrice,
      dailyPercentage: dailyChangePercentage,
      cumulativePercentage: cumulativeChangePercentage
    });

    currentPrice = araPrice; // Harga dasar hari berikutnya adalah harga ARA hari ini
  }

  return simulation;
}
