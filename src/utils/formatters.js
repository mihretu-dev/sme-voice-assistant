// Currency and date formatting helpers for Ethiopian SME context

/**
 * Format amount as ETB with comma thousands separator
 * Output: "ETB 12,500.00" (consistent everywhere)
 */
export function formatETB(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return 'ETB 0.00';
  const abs = Math.abs(Number(amount));
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  return `ETB ${formatted}`;
}

/**
 * Short form for cards: "ETB 12,500" or "4.6k ETB"
 */
export function formatShortETB(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return 'ETB 0';
  const abs = Math.abs(Number(amount));
  if (abs >= 1_000_000) return `ETB ${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)     return `ETB ${(abs / 1_000).toFixed(1)}k`;
  return formatETB(abs);
}

export function formatTime(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatFullDate(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Ethiopian (Ge'ez) Calendar ──────────────────────────────────────────────
// Ethiopian calendar has 13 months: 12 × 30 days + Pagumē (5 or 6 days)
// Epoch difference: Ethiopian New Year (Meskerem 1) = Sept 11 or 12 Gregorian

const ETH_MONTHS_EN = [
  'Meskerem', 'Tikemt', 'Hidar', 'Tahsas',
  'Tir', 'Yekatit', 'Megabit', 'Miazia',
  'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagumē',
];

const ETH_MONTHS_AM = [
  'መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ',
  'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዚያ',
  'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ',
];

/**
 * Convert a Gregorian Date to Ethiopian calendar representation.
 * Returns { year, month (1-13), day, monthName, monthNameAm }
 */
export function toEthiopianDate(date = new Date()) {
  const jdn = gregorianToJDN(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const { year, month, day } = jdnToEthiopian(jdn);
  return {
    year,
    month,
    day,
    monthName:   ETH_MONTHS_EN[month - 1] ?? 'Pagumē',
    monthNameAm: ETH_MONTHS_AM[month - 1] ?? 'ጳጉሜ',
  };
}

function gregorianToJDN(y, m, d) {
  return (
    Math.floor((1461 * (y + 4800 + Math.floor((m - 14) / 12))) / 4) +
    Math.floor((367 * (m - 2 - 12 * Math.floor((m - 14) / 12))) / 12) -
    Math.floor((3 * Math.floor((y + 4900 + Math.floor((m - 14) / 12)) / 100)) / 4) +
    d - 32075
  );
}

function jdnToEthiopian(jdn) {
  const r = (jdn - 1723856) % 1461;
  const n = r % 365 + 365 * Math.floor(r / 1460);
  const year  = 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day   = (n % 30) + 1;
  return { year, month, day };
}

/**
 * Format a timestamp as Ethiopian date string
 * e.g. "Meskerem 10, 2017" or "መስከረም 10፣ 2017"
 */
export function formatEthiopianDate(timestamp, amharic = false) {
  if (!timestamp) return '';
  const eth = toEthiopianDate(new Date(timestamp));
  if (amharic) {
    return `${eth.monthNameAm} ${eth.day}፣ ${eth.year}`;
  }
  return `${eth.monthName} ${eth.day}, ${eth.year}`;
}
