import React, { useState, useMemo } from 'react';
import { useBusiness } from '../context/BusinessContext';
import {
  formatETB,
  formatShortETB,
  formatTime,
  formatDate,
  toEthiopianDate,
  formatEthiopianDate,
} from '../utils/formatters';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Search,
  Filter,
  Mic,
  ArrowUpRight,
  ArrowDownRight,
  Package,
} from 'lucide-react';

const WEEKDAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAYS_AM = ['ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'አርብ', 'ቅዳሜ', 'እሁድ'];

export default function CalendarReports() {
  const { transactions, language } = useBusiness();
  const isAmharic = language === 'am';

  // Navigation month state (defaults to current month)
  const [currentDate, setCurrentDate] = useState(() => new Date());
  // Selected single day filter (null means full period range)
  const [selectedDay, setSelectedDay] = useState(null);
  // Quick period preset: 'today' | 'week' | 'month' | 'all' | 'custom'
  const [periodPreset, setPeriodPreset] = useState('month');
  // Table search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Ethiopian date for header
  const ethHeaderDate = useMemo(() => {
    return toEthiopianDate(new Date(currentYear, currentMonth, 15));
  }, [currentYear, currentMonth]);

  // Gregorian month name
  const gregMonthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Generate calendar days for the current displayed month
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Monday as 0, Sunday as 6
    let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6;

    const totalDays = lastDayOfMonth.getDate();
    const days = [];

    // Leading empty slots for previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ empty: true, key: `empty-${i}` });
    }

    const today = new Date();
    const isThisMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;

    for (let day = 1; day <= totalDays; day++) {
      const dateObj = new Date(currentYear, currentMonth, day);
      const ethInfo = toEthiopianDate(dateObj);
      const isToday = isThisMonth && today.getDate() === day;

      // Check transactions on this day
      const startOfDay = new Date(currentYear, currentMonth, day, 0, 0, 0).getTime();
      const endOfDay = new Date(currentYear, currentMonth, day, 23, 59, 59).getTime();

      const dayTxs = transactions.filter((t) => t.timestamp >= startOfDay && t.timestamp <= endOfDay);
      const hasSales = dayTxs.some((t) => t.type === 'sale');
      const hasExpenses = dayTxs.some((t) => t.type === 'expense');
      const hasStock = dayTxs.some((t) => t.type === 'stock');

      days.push({
        empty: false,
        key: `day-${day}`,
        day,
        ethDay: ethInfo.day,
        dateObj,
        isToday,
        txCount: dayTxs.length,
        hasSales,
        hasExpenses,
        hasStock,
      });
    }

    return days;
  }, [currentYear, currentMonth, transactions]);

  // Navigate calendar months
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const handleJumpToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDay(now.getDate());
    setPeriodPreset('today');
  };

  // Determine active start and end timestamp for filtering
  const { startTimestamp, endTimestamp, filterTitle } = useMemo(() => {
    const now = new Date();

    if (selectedDay) {
      const start = new Date(currentYear, currentMonth, selectedDay, 0, 0, 0).getTime();
      const end = new Date(currentYear, currentMonth, selectedDay, 23, 59, 59).getTime();
      const eth = toEthiopianDate(new Date(currentYear, currentMonth, selectedDay));
      return {
        startTimestamp: start,
        endTimestamp: end,
        filterTitle: isAmharic
          ? `${eth.monthNameAm} ${eth.day} (${selectedDay} ${gregMonthName})`
          : `${gregMonthName} ${selectedDay} (${eth.monthName} ${eth.day})`,
      };
    }

    if (periodPreset === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime();
      return {
        startTimestamp: start,
        endTimestamp: end,
        filterTitle: isAmharic ? 'የዛሬ ግብይቶች' : "Today's Transactions",
      };
    }

    if (periodPreset === 'week') {
      const dayOfWeek = now.getDay() || 7;
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1, 0, 0, 0).getTime();
      const end = now.getTime();
      return {
        startTimestamp: start,
        endTimestamp: end,
        filterTitle: isAmharic ? 'የዚህ ሳምንት ግብይቶች' : 'This Week',
      };
    }

    if (periodPreset === 'month') {
      const start = new Date(currentYear, currentMonth, 1, 0, 0, 0).getTime();
      const end = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).getTime();
      return {
        startTimestamp: start,
        endTimestamp: end,
        filterTitle: isAmharic ? `${ethHeaderDate.monthNameAm} ${ethHeaderDate.year}` : gregMonthName,
      };
    }

    // All time
    return {
      startTimestamp: 0,
      endTimestamp: Infinity,
      filterTitle: isAmharic ? 'ሁሉም ግብይቶች' : 'All-Time Ledger',
    };
  }, [selectedDay, periodPreset, currentYear, currentMonth, gregMonthName, ethHeaderDate, isAmharic]);

  // Filtered transactions for the selected period
  const periodTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const inTime = tx.timestamp >= startTimestamp && tx.timestamp <= endTimestamp;
      if (!inTime) return false;

      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const itemName = (tx.item || '').toLowerCase();
        const itemAm = (tx.itemAm || '').toLowerCase();
        const note = (tx.note || '').toLowerCase();
        if (!itemName.includes(q) && !itemAm.includes(q) && !note.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, startTimestamp, endTimestamp, typeFilter, searchQuery]);

  // Aggregates for the selected period
  const periodSummary = useMemo(() => {
    let salesTotal = 0;
    let expensesTotal = 0;
    let salesCount = 0;
    let expenseCount = 0;

    transactions.forEach((tx) => {
      if (tx.timestamp >= startTimestamp && tx.timestamp <= endTimestamp) {
        if (tx.type === 'sale') {
          salesTotal += Number(tx.amount || 0);
          salesCount++;
        } else if (tx.type === 'expense') {
          expensesTotal += Number(tx.amount || 0);
          expenseCount++;
        }
      }
    });

    return {
      salesTotal,
      expensesTotal,
      netCash: salesTotal - expensesTotal,
      salesCount,
      expenseCount,
      totalCount: salesCount + expenseCount,
    };
  }, [transactions, startTimestamp, endTimestamp]);

  // CSV Export for the current period
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Date (Gregorian)',
      'Date (Ethiopian)',
      'Time',
      'Type',
      'Item (EN)',
      'Item (AM)',
      'Quantity',
      'Unit',
      'Amount (ETB)',
      'Source',
      'Note',
    ];

    const rows = periodTransactions.map((tx) => [
      tx.id,
      new Date(tx.timestamp).toLocaleDateString('en-GB'),
      formatEthiopianDate(tx.timestamp, isAmharic),
      formatTime(tx.timestamp),
      tx.type.toUpperCase(),
      `"${tx.item || ''}"`,
      `"${tx.itemAm || ''}"`,
      tx.quantity || 1,
      tx.unit || 'unit',
      tx.amount || 0,
      tx.source || 'voice',
      `"${(tx.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `birrvoice-report-${filterTitle.replace(/[^a-z0-9]/gi, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* ── Top Bar: Period Presets & Export ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-panel border border-theme">
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'today', labelEn: 'Today', labelAm: 'ዛሬ' },
            { id: 'week', labelEn: 'This Week', labelAm: 'በዚህ ሳምንት' },
            { id: 'month', labelEn: 'This Month', labelAm: 'በዚህ ወር' },
            { id: 'all', labelEn: 'All Time', labelAm: 'ሁሉንም' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setPeriodPreset(tab.id);
                setSelectedDay(null);
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                periodPreset === tab.id && selectedDay === null
                  ? 'bg-teal text-white shadow-sm'
                  : 'bg-raised hover:bg-surface text-t2 border border-theme'
              }`}
              style={{
                backgroundColor:
                  periodPreset === tab.id && selectedDay === null ? 'var(--c-teal)' : undefined,
              }}
            >
              {isAmharic ? tab.labelAm : tab.labelEn}
            </button>
          ))}
          {selectedDay && (
            <span className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-muted text-teal border border-teal/30 shrink-0">
              {isAmharic ? `ቀን ${selectedDay}` : `Day ${selectedDay}`}
            </span>
          )}
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all active:scale-95 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
        >
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>{isAmharic ? 'የሪፖርት ፋይል አውርድ (CSV)' : 'Export Period CSV'}</span>
        </button>
      </div>

      {/* ── Period Summary KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Sales */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-panel border border-theme flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-t3">
            <span>{isAmharic ? 'የተመረጠው ጊዜ ሽያጭ' : 'Period Sales'}</span>
            <span className="p-1 sm:p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div className="my-1.5 sm:my-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-t1">
              {formatETB(periodSummary.salesTotal)}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-t4">
            {periodSummary.salesCount} {isAmharic ? 'ሽያጮች' : 'sales transactions'}
          </span>
        </div>

        {/* Expenses */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-panel border border-theme flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-t3">
            <span>{isAmharic ? 'የተመረጠው ጊዜ ወጪ' : 'Period Expenses'}</span>
            <span className="p-1 sm:p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div className="my-1.5 sm:my-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-t1">
              {formatETB(periodSummary.expensesTotal)}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-t4">
            {periodSummary.expenseCount} {isAmharic ? 'የወጪ ምዝገባዎች' : 'expense entries'}
          </span>
        </div>

        {/* Net Profit */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-panel border border-theme flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-t3">
            <span>{isAmharic ? 'የተጣራ ትርፍ (Net Profit)' : 'Net Profit / Margin'}</span>
            <span className="p-1 sm:p-1.5 rounded-lg bg-teal-muted text-teal">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div className="my-1.5 sm:my-2">
            <span
              className={`text-xl sm:text-2xl font-bold font-mono ${
                periodSummary.netCash >= 0 ? 'text-teal' : 'text-rose-400'
              }`}
            >
              {formatETB(periodSummary.netCash)}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-t4">
            {isAmharic ? 'የሽያጭ ሲቀነስ ወጪ ድምር' : 'Sales minus expenses'}
          </span>
        </div>
      </div>

      {/* ── Dual Ethiopian & Gregorian Calendar ── */}
      <div className="p-3.5 sm:p-6 rounded-2xl bg-panel border border-theme space-y-3 sm:space-y-4">
        {/* Calendar Month Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pb-3 border-b border-theme">
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-teal" />
              <h2 className="text-sm sm:text-base font-bold text-t1">
                {isAmharic
                  ? `${ethHeaderDate.monthNameAm} ${ethHeaderDate.year} • ${gregMonthName}`
                  : `${gregMonthName} • ${ethHeaderDate.monthName} ${ethHeaderDate.year}`}
              </h2>
            </div>
            <p className="text-[10px] sm:text-[11px] text-t4 mt-0.5">
              {isAmharic
                ? 'የኢትዮጵያ (ግዕዝ) እና ፈረንጅ የቀን መቁጠሪያ'
                : 'Dual Ethiopian & Gregorian calendar'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleJumpToday}
              className="px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold bg-raised hover:bg-surface border border-theme text-t2"
            >
              {isAmharic ? 'ዛሬ' : 'Today'}
            </button>
            <div className="flex items-center rounded-xl bg-raised border border-theme p-0.5">
              <button
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="p-1.5 hover:text-teal text-t3 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                aria-label="Next month"
                className="p-1.5 hover:text-teal text-t3 rounded-lg transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-xs font-semibold text-t4 py-1">
          {(isAmharic ? WEEKDAYS_AM : WEEKDAYS_EN).map((w, idx) => (
            <div key={idx} className="py-0.5">
              {w}
            </div>
          ))}
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((d) => {
            if (d.empty) {
              return (
                <div
                  key={d.key}
                  className="h-12 sm:h-20 rounded-xl bg-surface/30 border border-transparent"
                />
              );
            }

            const isSelected = selectedDay === d.day;

            return (
              <button
                key={d.key}
                onClick={() => setSelectedDay(isSelected ? null : d.day)}
                className={`h-12 sm:h-20 p-1 sm:p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all relative ${
                  isSelected
                    ? 'bg-teal text-white border-teal shadow-md ring-2 ring-teal/30 scale-[1.02]'
                    : d.isToday
                    ? 'bg-teal-muted/40 border-teal text-t1'
                    : 'bg-raised hover:bg-surface border-theme text-t2'
                }`}
              >
                {/* Gregorian & Ethiopian Day Number */}
                <div className="flex items-start justify-between">
                  <span className="text-[11px] sm:text-sm font-bold font-mono leading-none">
                    {d.day}
                  </span>
                  <span
                    className={`text-[8px] sm:text-[10px] font-mono opacity-60 ${
                      isSelected ? 'text-white' : 'text-teal'
                    }`}
                  >
                    {d.ethDay}
                  </span>
                </div>

                {/* Activity Dots */}
                <div className="flex items-center gap-1 mt-auto">
                  {d.hasSales && (
                    <span
                      title="Sales recorded"
                      className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                    />
                  )}
                  {d.hasExpenses && (
                    <span
                      title="Expenses recorded"
                      className="w-1.5 h-1.5 rounded-full bg-rose-400"
                    />
                  )}
                  {d.hasStock && (
                    <span
                      title="Stock restocked"
                      className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                    />
                  )}
                  {d.txCount > 0 && (
                    <span
                      className={`text-[9px] font-mono ml-auto opacity-75 ${
                        isSelected ? 'text-white' : 'text-t4'
                      }`}
                    >
                      {d.txCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-t4 border-t border-theme">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{isAmharic ? 'ሽያጭ (Sale)' : 'Sale'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>{isAmharic ? 'ወጪ (Expense)' : 'Expense'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>{isAmharic ? 'የዕቃ ጭማሪ (Restock)' : 'Restock'}</span>
          </div>
          <span className="ml-auto text-t4 italic">
            {isAmharic ? '*የላይኛው ቁጥር ፈረንጅ፤ የታችኛው የግዕዝ ቀን' : '*Top number: Gregorian, Right: Ethiopian day'}
          </span>
        </div>
      </div>

      {/* ── Transaction Table for Selected Period ── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-panel border border-theme space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-t1">
              {isAmharic ? `የ${filterTitle} ዝርዝር ግብይቶች` : `Ledger Transactions (${filterTitle})`}
            </h3>
            <p className="text-[11px] text-t4">
              {periodTransactions.length} {isAmharic ? 'ግብይቶች ተገኝተዋል' : 'records found'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-t4" />
              <input
                type="text"
                placeholder={isAmharic ? 'ዕቃ ፈልግ...' : 'Search items...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-raised border border-theme text-t1 placeholder-t4 focus:outline-none focus:border-teal"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-raised border border-theme text-t1 focus:outline-none focus:border-teal"
            >
              <option value="all">{isAmharic ? 'ሁሉም አይነቶች' : 'All Types'}</option>
              <option value="sale">{isAmharic ? 'ሽያጭ ብቻ' : 'Sales Only'}</option>
              <option value="expense">{isAmharic ? 'ወጪ ብቻ' : 'Expenses Only'}</option>
              <option value="stock">{isAmharic ? 'ጭማሪ ብቻ' : 'Stock Only'}</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto rounded-xl border border-theme">
          <table className="w-full text-left text-xs">
            <thead className="bg-raised/70 border-b border-theme text-t3 font-medium">
              <tr>
                <th className="py-2.5 px-3">{isAmharic ? 'ቀንና ሰዓት' : 'Date & Time'}</th>
                <th className="py-2.5 px-3">{isAmharic ? 'ዓይነት' : 'Type'}</th>
                <th className="py-2.5 px-3">{isAmharic ? 'የዕቃ / ወጪ ስም' : 'Item / Expense'}</th>
                <th className="py-2.5 px-3">{isAmharic ? 'ብዛት' : 'Qty'}</th>
                <th className="py-2.5 px-3 text-right">{isAmharic ? 'ዋጋ (ETB)' : 'Amount (ETB)'}</th>
                <th className="py-2.5 px-3">{isAmharic ? 'ምንጭ' : 'Source'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme">
              {periodTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-t4">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>{isAmharic ? 'ለዚህ ጊዜ የተመዘገበ ግብይት የለም' : 'No transactions recorded for this period'}</p>
                    <p className="text-[10px] mt-1 text-t4 opacity-75">
                      {isAmharic ? 'በድምፅ ለመመዝገብ የማይክሮፎን አዶውን ይጫኑ' : 'Log a transaction hands-free using the voice mic'}
                    </p>
                  </td>
                </tr>
              ) : (
                periodTransactions.map((tx) => {
                  const isSale = tx.type === 'sale';
                  const isExpense = tx.type === 'expense';
                  const isStock = tx.type === 'stock';

                  return (
                    <tr key={tx.id} className="hover:bg-raised/40 transition-colors">
                      <td className="py-2.5 px-3 text-t3 whitespace-nowrap">
                        <div className="font-mono text-t2">{formatDate(tx.timestamp)} {formatTime(tx.timestamp)}</div>
                        <div className="text-[10px] text-t4">{formatEthiopianDate(tx.timestamp, isAmharic)}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isSale
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isExpense
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          }`}
                        >
                          {isSale && <ArrowUpRight className="w-3 h-3" />}
                          {isExpense && <ArrowDownRight className="w-3 h-3" />}
                          {isStock && <Package className="w-3 h-3" />}
                          {isSale
                            ? isAmharic ? 'ሽያጭ' : 'Sale'
                            : isExpense
                            ? isAmharic ? 'ወጪ' : 'Expense'
                            : isAmharic ? 'ጭማሪ' : 'Stock'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-t1">
                        <div>{isAmharic ? tx.itemAm || tx.item : tx.item}</div>
                        {tx.note && <div className="text-[10px] text-t4 truncate max-w-xs">{tx.note}</div>}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-t2 whitespace-nowrap">
                        {tx.quantity} {tx.unit}
                      </td>
                      <td
                        className={`py-2.5 px-3 font-mono font-bold text-right whitespace-nowrap ${
                          isSale
                            ? 'text-emerald-400'
                            : isExpense
                            ? 'text-rose-400'
                            : 'text-t3'
                        }`}
                      >
                        {isSale && '+ '}
                        {isExpense && '- '}
                        {formatETB(tx.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-t4 whitespace-nowrap">
                        {tx.source === 'voice' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-teal">
                            <Mic className="w-3 h-3" />
                            Voice
                          </span>
                        ) : (
                          <span className="text-[11px] text-t4">Manual</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
