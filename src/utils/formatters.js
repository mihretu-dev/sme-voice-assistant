// Currency and date formatting helpers for Ethiopian SME context

export function formatETB(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '0.00 ETB';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('ETB', '').trim() + ' ETB';
}

export function formatShortETB(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ETB';
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1) + 'M ETB';
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + 'k ETB';
  }
  return formatETB(amount);
}

export function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
