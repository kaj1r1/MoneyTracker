// ========================================
// stats.js — Halaman Statistik Keuangan & Grafik
// ========================================

let statsPeriod = 'thisMonth'; // 'thisMonth' | 'lastMonth' | 'all'
let statsTimelineMode = 'daily'; // 'daily' | 'cumulative'

// Referensi instance Chart.js untuk mencegah bentrok canvas
let comparisonChartInstance = null;
let expenseCategoryChartInstance = null;
let incomeCategoryChartInstance = null;

// Palette warna konsisten untuk kategori
const STATS_CATEGORY_COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#14B8A6', '#84CC16', '#6366F1',
  '#F97316', '#A855F7', '#EAB308', '#0EA5E9', '#64748B'
];

/**
 * Render Halaman Statistik
 */
function renderStats() {
  const content = document.getElementById('app-content');
  if (!content) return;

  // Ambil transaksi berdasarkan periode yang dipilih
  const filteredTxs = getStatsFilteredTransactions();

  // Hitung total
  const totalIncome = filteredTxs
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpense = filteredTxs
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const netSavings = totalIncome - totalExpense;
  const expenseRatio = totalIncome > 0 ? Math.min(100, Math.round((totalExpense / totalIncome) * 100)) : (totalExpense > 0 ? 100 : 0);

  // Data per kategori
  const expenseByCategory = getCategoryBreakdown(filteredTxs, 'expense');
  const incomeByCategory = getCategoryBreakdown(filteredTxs, 'income');

  content.innerHTML = `
    <!-- ======= 1. HEADER ======= -->
    <header class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2.5">
        <a href="#/dashboard"
           aria-label="Kembali ke Dashboard"
           class="btn-compact w-10 h-10 rounded-full bg-white dark:bg-[#132A23] border border-gray-200 dark:border-[#1F4A3C] flex items-center justify-center text-gray-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors shadow-sm">
          <i data-lucide="chevron-left" class="w-5 h-5"></i>
        </a>
        <div>
          <h1 class="text-xl font-bold text-gray-900 dark:text-green-50 leading-tight">Statistik Keuangan</h1>
          <p class="text-xs text-gray-400 dark:text-green-300/60 font-medium">Analisis pemasukan, pengeluaran & grafik</p>
        </div>
      </div>

      <button
        onclick="openAddModal()"
        class="btn-compact w-10 h-10 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-colors shadow-sm"
        title="Tambah Transaksi">
        <i data-lucide="plus" class="w-4 h-4"></i>
      </button>
    </header>

    <!-- ======= 2. PERIODE FILTER TABS ======= -->
    <div class="bg-gray-200/80 dark:bg-[#132A23] p-1 rounded-2xl flex items-center gap-1 border border-gray-200/60 dark:border-[#1F4A3C] mb-4">
      <button
        onclick="switchStatsPeriod('thisMonth')"
        class="tab-btn flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center ${statsPeriod === 'thisMonth' ? 'bg-white dark:bg-green-800 text-green-950 dark:text-white shadow-xs font-bold' : 'text-gray-500 dark:text-green-300/60'}">
        Bulan Ini
      </button>
      <button
        onclick="switchStatsPeriod('lastMonth')"
        class="tab-btn flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center ${statsPeriod === 'lastMonth' ? 'bg-white dark:bg-green-800 text-green-950 dark:text-white shadow-xs font-bold' : 'text-gray-500 dark:text-green-300/60'}">
        Bulan Lalu
      </button>
      <button
        onclick="switchStatsPeriod('all')"
        class="tab-btn flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center ${statsPeriod === 'all' ? 'bg-white dark:bg-green-800 text-green-950 dark:text-white shadow-xs font-bold' : 'text-gray-500 dark:text-green-300/60'}">
        Semua Waktu
      </button>
    </div>

    <!-- ======= 3. BAGIAN 1: PERBANDINGAN PEMASUKAN & PENGELUARAN ======= -->
    <section class="space-y-3 mb-6" aria-labelledby="heading-comparison">
      <div class="flex items-center justify-between px-1">
        <h2 id="heading-comparison" class="text-sm font-bold text-gray-900 dark:text-green-50 flex items-center gap-1.5">
          <i data-lucide="scale" class="w-4 h-4 text-green-600 dark:text-lime-400"></i>
          <span>Perbandingan Pemasukan & Pengeluaran</span>
        </h2>
        <span class="text-[11px] font-semibold text-gray-400">${getStatsPeriodLabel()}</span>
      </div>

      <!-- Ringkasan Angka (KPI Cards) -->
      <div class="grid grid-cols-2 gap-2.5">
        <!-- Pemasukan -->
        <div class="p-3.5 bg-white dark:bg-[#132A23] rounded-2xl border border-gray-100 dark:border-[#1F4A3C] shadow-xs">
          <div class="flex items-center gap-2 mb-1.5">
            <div class="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-950/60 flex items-center justify-center text-green-600 dark:text-lime-400">
              <i data-lucide="trending-up" class="w-4 h-4"></i>
            </div>
            <span class="text-xs font-medium text-gray-500 dark:text-green-300/70">Pemasukan</span>
          </div>
          <p class="text-base font-extrabold text-green-600 dark:text-lime-400 tabular-nums">
            +${formatCurrencyShort(totalIncome)}
          </p>
        </div>

        <!-- Pengeluaran -->
        <div class="p-3.5 bg-white dark:bg-[#132A23] rounded-2xl border border-gray-100 dark:border-[#1F4A3C] shadow-xs">
          <div class="flex items-center gap-2 mb-1.5">
            <div class="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-500">
              <i data-lucide="trending-down" class="w-4 h-4"></i>
            </div>
            <span class="text-xs font-medium text-gray-500 dark:text-green-300/70">Pengeluaran</span>
          </div>
          <p class="text-base font-extrabold text-red-500 dark:text-red-400 tabular-nums">
            −${formatCurrencyShort(totalExpense)}
          </p>
        </div>
      </div>

      <!-- Kartu Grafik Perbandingan -->
      <div class="p-4 sm:p-5 bg-white dark:bg-[#132A23] rounded-[24px] border border-gray-100 dark:border-[#1F4A3C] shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <div>
            <p class="text-xs text-gray-400">Selisih Bersih (Tabungan)</p>
            <p class="text-lg font-extrabold tabular-nums ${netSavings >= 0 ? 'text-green-600 dark:text-lime-400' : 'text-red-500'}">
              ${netSavings >= 0 ? '+' : ''}${formatCurrency(netSavings)}
            </p>
          </div>
          <span class="text-xs font-bold px-2.5 py-1 rounded-full ${netSavings >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-950/70 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300'}">
            ${netSavings >= 0 ? 'Surplus' : 'Defisit'}
          </span>
        </div>

        <!-- Progress Bar Rasio Pengeluaran -->
        <div class="space-y-1 mb-3.5">
          <div class="flex items-center justify-between text-[11px] text-gray-400">
            <span>Rasio Terpakai: <strong class="text-gray-700 dark:text-green-200">${expenseRatio}%</strong></span>
            <span>${totalIncome > 0 ? (100 - expenseRatio) + '% tersisa' : ''}</span>
          </div>
          <div class="w-full h-2 rounded-full bg-gray-100 dark:bg-[#1A3B31] overflow-hidden flex">
            <div style="width: ${expenseRatio}%" class="h-full bg-red-500 rounded-l-full transition-all duration-500"></div>
            <div style="width: ${Math.max(0, 100 - expenseRatio)}%" class="h-full bg-green-500 rounded-r-full transition-all duration-500"></div>
          </div>
        </div>

        <!-- Mode Toggle & Header Diagram Garis -->
        <div class="flex items-center justify-between mb-2 pt-2 border-t border-gray-100 dark:border-[#1F4A3C]/70">
          <span class="text-[11px] font-bold text-gray-500 dark:text-green-300/80 flex items-center gap-1.5">
            <i data-lucide="trending-up" class="w-3.5 h-3.5 text-green-600 dark:text-lime-400"></i>
            <span>Tren Diagram Garis</span>
          </span>
          <div class="flex items-center bg-gray-100 dark:bg-[#1A3B31] p-0.5 rounded-lg text-[10px]">
            <button
              onclick="switchStatsTimelineMode('daily')"
              class="px-2 py-0.5 rounded-md font-semibold transition-all ${statsTimelineMode === 'daily' ? 'bg-white dark:bg-green-800 text-green-950 dark:text-white shadow-xs font-bold' : 'text-gray-500 dark:text-green-300/60'}">
              Harian
            </button>
            <button
              onclick="switchStatsTimelineMode('cumulative')"
              class="px-2 py-0.5 rounded-md font-semibold transition-all ${statsTimelineMode === 'cumulative' ? 'bg-white dark:bg-green-800 text-green-950 dark:text-white shadow-xs font-bold' : 'text-gray-500 dark:text-green-300/60'}">
              Akumulasi
            </button>
          </div>
        </div>

        <!-- Canvas Grafik Perbandingan (Line Chart) -->
        <div class="relative h-56 w-full">
          <canvas id="statsComparisonCanvas"></canvas>
        </div>
      </div>
    </section>

    <!-- ======= 4. BAGIAN 2: CHART KATEGORI PENGELUARAN ======= -->
    <section class="space-y-3 mb-6" aria-labelledby="heading-expense-cat">
      <div class="flex items-center justify-between px-1">
        <h2 id="heading-expense-cat" class="text-sm font-bold text-gray-900 dark:text-green-50 flex items-center gap-1.5">
          <i data-lucide="pie-chart" class="w-4 h-4 text-red-500"></i>
          <span>Kategori Pengeluaran</span>
        </h2>
        <span class="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md">
          Total: ${formatCurrencyShort(totalExpense)}
        </span>
      </div>

      <div class="p-4 sm:p-5 bg-white dark:bg-[#132A23] rounded-[24px] border border-gray-100 dark:border-[#1F4A3C] shadow-sm">
        ${expenseByCategory.length === 0 ? `
          <div class="py-8 text-center text-gray-400">
            <i data-lucide="shopping-bag" class="w-8 h-8 mx-auto mb-1.5 opacity-40"></i>
            <p class="text-xs font-semibold">Tidak ada data pengeluaran pada periode ini</p>
          </div>
        ` : `
          <!-- Canvas Donut Chart Pengeluaran -->
          <div class="relative h-56 w-full mb-4">
            <canvas id="statsExpenseCategoryCanvas"></canvas>
          </div>

          <!-- Rincian List Kategori Pengeluaran -->
          <div class="space-y-2.5 pt-3 border-t border-gray-100 dark:border-[#1F4A3C]/70">
            ${expenseByCategory.map((item, idx) => {
              const color = STATS_CATEGORY_COLORS[idx % STATS_CATEGORY_COLORS.length];
              return `
                <div class="space-y-1">
                  <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${color}"></span>
                      <span class="font-bold text-gray-800 dark:text-green-100 truncate">${escapeHtml(item.name)}</span>
                      <span class="text-[10px] text-gray-400">(${item.count} tx)</span>
                    </div>
                    <div class="text-right flex-shrink-0 flex items-center gap-2">
                      <span class="text-[11px] text-gray-400 font-medium">${item.percent}%</span>
                      <span class="font-extrabold text-red-500 tabular-nums">−${formatCurrency(item.amount)}</span>
                    </div>
                  </div>
                  <div class="w-full h-1.5 bg-gray-100 dark:bg-[#1A3B31] rounded-full overflow-hidden">
                    <div style="width: ${item.percent}%; background-color: ${color}" class="h-full rounded-full transition-all duration-300"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </section>

    <!-- ======= 5. BAGIAN 3: CHART KATEGORI PEMASUKAN ======= -->
    <section class="space-y-3 mb-6" aria-labelledby="heading-income-cat">
      <div class="flex items-center justify-between px-1">
        <h2 id="heading-income-cat" class="text-sm font-bold text-gray-900 dark:text-green-50 flex items-center gap-1.5">
          <i data-lucide="pie-chart" class="w-4 h-4 text-green-600 dark:text-lime-400"></i>
          <span>Kategori Pemasukan</span>
        </h2>
        <span class="text-xs font-bold text-green-600 dark:text-lime-400 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-md">
          Total: +${formatCurrencyShort(totalIncome)}
        </span>
      </div>

      <div class="p-4 sm:p-5 bg-white dark:bg-[#132A23] rounded-[24px] border border-gray-100 dark:border-[#1F4A3C] shadow-sm">
        ${incomeByCategory.length === 0 ? `
          <div class="py-8 text-center text-gray-400">
            <i data-lucide="coins" class="w-8 h-8 mx-auto mb-1.5 opacity-40"></i>
            <p class="text-xs font-semibold">Tidak ada data pemasukan pada periode ini</p>
          </div>
        ` : `
          <!-- Canvas Donut Chart Pemasukan -->
          <div class="relative h-56 w-full mb-4">
            <canvas id="statsIncomeCategoryCanvas"></canvas>
          </div>

          <!-- Rincian List Kategori Pemasukan -->
          <div class="space-y-2.5 pt-3 border-t border-gray-100 dark:border-[#1F4A3C]/70">
            ${incomeByCategory.map((item, idx) => {
              const color = STATS_CATEGORY_COLORS[(idx + 4) % STATS_CATEGORY_COLORS.length];
              return `
                <div class="space-y-1">
                  <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${color}"></span>
                      <span class="font-bold text-gray-800 dark:text-green-100 truncate">${escapeHtml(item.name)}</span>
                      <span class="text-[10px] text-gray-400">(${item.count} tx)</span>
                    </div>
                    <div class="text-right flex-shrink-0 flex items-center gap-2">
                      <span class="text-[11px] text-gray-400 font-medium">${item.percent}%</span>
                      <span class="font-extrabold text-green-600 dark:text-lime-400 tabular-nums">+${formatCurrency(item.amount)}</span>
                    </div>
                  </div>
                  <div class="w-full h-1.5 bg-gray-100 dark:bg-[#1A3B31] rounded-full overflow-hidden">
                    <div style="width: ${item.percent}%; background-color: ${color}" class="h-full rounded-full transition-all duration-300"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </section>
  `;

  // Render Charts setelah DOM siap
  initStatsCharts(totalIncome, totalExpense, expenseByCategory, incomeByCategory, filteredTxs);

  // Inisialisasi ikon Lucide
  lucide.createIcons();
}

/**
 * Ganti tab periode statistik
 */
function switchStatsPeriod(period) {
  statsPeriod = period;
  renderStats();
}

/**
 * Ganti mode diagram garis (harian vs akumulasi)
 */
function switchStatsTimelineMode(mode) {
  statsTimelineMode = mode;
  renderStats();
}

/**
 * Filter transaksi sesuai periode
 */
function getStatsFilteredTransactions() {
  if (statsPeriod === 'thisMonth') {
    return Store.filterTransactions({
      startDate: startOfMonthISO(),
      endDate: endOfMonthISO()
    });
  } else if (statsPeriod === 'lastMonth') {
    return Store.filterTransactions({
      startDate: startOfLastMonthISO(),
      endDate: endOfLastMonthISO()
    });
  }
  // 'all'
  return Store.getTransactions();
}

/**
 * Label teks periode terpilih
 */
function getStatsPeriodLabel() {
  if (statsPeriod === 'thisMonth') return 'Bulan Ini';
  if (statsPeriod === 'lastMonth') return 'Bulan Lalu';
  return 'Semua Waktu';
}

/**
 * Hitung agregasi per kategori
 */
function getCategoryBreakdown(transactions, type) {
  const filtered = transactions.filter(t => t.type === type);
  const total = filtered.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const map = {};
  filtered.forEach(t => {
    const cat = Store.getCategory(t.categoryId);
    const catName = cat?.name || (type === 'income' ? 'Pemasukan Lain' : 'Pengeluaran Lain');
    const catId = t.categoryId || 'unknown';

    if (!map[catId]) {
      map[catId] = {
        id: catId,
        name: catName,
        icon: cat?.icon || 'tag',
        amount: 0,
        count: 0
      };
    }
    map[catId].amount += (Number(t.amount) || 0);
    map[catId].count += 1;
  });

  const list = Object.values(map).map(item => ({
    ...item,
    percent: total > 0 ? Math.round((item.amount / total) * 100) : 0
  }));

  // Urutkan dari nominal terbesar ke terkecil
  return list.sort((a, b) => b.amount - a.amount);
}

/**
 * Susun timeline data untuk diagram garis perbandingan
 */
function getStatsTimelineData(transactions, period, mode) {
  const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  let days = [];

  if (period === 'thisMonth') {
    const start = new Date(startOfMonthISO());
    const end = new Date(todayISO());
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'));
    }
    // Jika masih awal bulan, rentang minimal 5 hari agar garis terbentuk indah
    if (days.length < 5) {
      const endMonth = new Date(endOfMonthISO());
      for (let d = new Date(end); d <= endMonth && days.length < 7; d.setDate(d.getDate() + 1)) {
        const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        if (!days.includes(iso)) days.push(iso);
      }
    }
  } else if (period === 'lastMonth') {
    const start = new Date(startOfLastMonthISO());
    const end = new Date(endOfLastMonthISO());
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'));
    }
  } else {
    // 'all'
    if (!transactions || transactions.length === 0) {
      return { labels: ['Hari Ini'], incomeData: [0], expenseData: [0] };
    }
    const dates = transactions
      .map(t => t.date || (t.createdAt ? t.createdAt.slice(0, 10) : ''))
      .filter(Boolean)
      .sort();

    if (dates.length === 0) {
      return { labels: ['Hari Ini'], incomeData: [0], expenseData: [0] };
    }

    const minD = new Date(dates[0]);
    const maxD = new Date(dates[dates.length - 1]);
    const diffDays = Math.ceil((maxD - minD) / (1000 * 60 * 60 * 24));

    if (diffDays <= 31) {
      for (let d = new Date(minD); d <= maxD; d.setDate(d.getDate() + 1)) {
        days.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'));
      }
    } else {
      // Kelompokkan per bulan jika rentang panjang
      const monthMap = {};
      transactions.forEach(t => {
        const d = t.date || (t.createdAt ? t.createdAt.slice(0, 10) : '');
        if (!d) return;
        const mKey = d.slice(0, 7);
        if (!monthMap[mKey]) monthMap[mKey] = { inc: 0, exp: 0 };
        const amt = Number(t.amount) || 0;
        if (t.type === 'income') monthMap[mKey].inc += amt;
        if (t.type === 'expense') monthMap[mKey].exp += amt;
      });
      const mKeys = Object.keys(monthMap).sort();
      const labels = mKeys.map(k => {
        const [y, m] = k.split('-');
        return `${monthNames[parseInt(m, 10) - 1]} ${y.slice(2)}`;
      });
      if (mode === 'cumulative') {
        let ci = 0, ce = 0;
        return {
          labels,
          incomeData: mKeys.map(k => { ci += monthMap[k].inc; return ci; }),
          expenseData: mKeys.map(k => { ce += monthMap[k].exp; return ce; })
        };
      }
      return {
        labels,
        incomeData: mKeys.map(k => monthMap[k].inc),
        expenseData: mKeys.map(k => monthMap[k].exp)
      };
    }
  }

  const labels = days.map(dStr => {
    const d = new Date(dStr);
    return `${String(d.getDate()).padStart(2, '0')} ${monthNames[d.getMonth()]}`;
  });

  const incomeMap = {};
  const expenseMap = {};
  transactions.forEach(t => {
    const d = t.date || (t.createdAt ? t.createdAt.slice(0, 10) : '');
    const amt = Number(t.amount) || 0;
    if (t.type === 'income') incomeMap[d] = (incomeMap[d] || 0) + amt;
    if (t.type === 'expense') expenseMap[d] = (expenseMap[d] || 0) + amt;
  });

  let incomeData = [];
  let expenseData = [];

  if (mode === 'cumulative') {
    let ci = 0, ce = 0;
    incomeData = days.map(d => { ci += (incomeMap[d] || 0); return ci; });
    expenseData = days.map(d => { ce += (expenseMap[d] || 0); return ce; });
  } else {
    incomeData = days.map(d => incomeMap[d] || 0);
    expenseData = days.map(d => expenseMap[d] || 0);
  }

  return { labels, incomeData, expenseData };
}

/**
 * Inisialisasi dan render Chart.js
 */
function initStatsCharts(totalIncome, totalExpense, expenseCategories, incomeCategories, filteredTxs = []) {
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#94A3B8' : '#64748B';
  const gridColor = isDark ? '#1F4A3C' : '#E2E8F0';

  // 1. Chart Perbandingan Pemasukan vs Pengeluaran (Diagram Garis / Line Chart)
  const compCanvas = document.getElementById('statsComparisonCanvas');
  if (compCanvas && typeof Chart !== 'undefined') {
    if (comparisonChartInstance) comparisonChartInstance.destroy();

    const timeline = getStatsTimelineData(filteredTxs, statsPeriod, statsTimelineMode);

    comparisonChartInstance = new Chart(compCanvas, {
      type: 'line',
      data: {
        labels: timeline.labels,
        datasets: [
          {
            label: 'Pemasukan',
            data: timeline.incomeData,
            borderColor: '#22C55E', // Hijau
            backgroundColor: 'rgba(34, 197, 94, 0.12)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#22C55E',
            pointBorderColor: isDark ? '#132A23' : '#FFFFFF',
            pointBorderWidth: 2,
            pointRadius: 3.5,
            pointHoverRadius: 6,
          },
          {
            label: 'Pengeluaran',
            data: timeline.expenseData,
            borderColor: '#EF4444', // Merah
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#EF4444',
            pointBorderColor: isDark ? '#132A23' : '#FFFFFF',
            pointBorderWidth: 2,
            pointRadius: 3.5,
            pointHoverRadius: 6,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 8,
              boxHeight: 8,
              usePointStyle: true,
              pointStyle: 'circle',
              color: textColor,
              padding: 10,
              font: { size: 11, weight: '600' }
            }
          },
          tooltip: {
            backgroundColor: isDark ? '#0A1F1B' : '#1E293B',
            titleColor: '#FFFFFF',
            bodyColor: '#FFFFFF',
            padding: 10,
            cornerRadius: 10,
            callbacks: {
              label: function(ctx) {
                return ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: textColor,
              font: { size: 10 },
              maxTicksLimit: 6,
              maxRotation: 0
            }
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { size: 10 },
              callback: function(val) {
                return formatCurrencyShort(val);
              }
            },
            beginAtZero: true
          }
        }
      }
    });
  }

  // 2. Chart Kategori Pengeluaran (Doughnut Chart)
  const expCanvas = document.getElementById('statsExpenseCategoryCanvas');
  if (expCanvas && expenseCategories.length > 0 && typeof Chart !== 'undefined') {
    if (expenseCategoryChartInstance) expenseCategoryChartInstance.destroy();

    const colors = expenseCategories.map((_, i) => STATS_CATEGORY_COLORS[i % STATS_CATEGORY_COLORS.length]);

    expenseCategoryChartInstance = new Chart(expCanvas, {
      type: 'doughnut',
      data: {
        labels: expenseCategories.map(c => c.name),
        datasets: [{
          data: expenseCategories.map(c => c.amount),
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: isDark ? '#132A23' : '#FFFFFF',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(ctx) {
                const item = expenseCategories[ctx.dataIndex];
                return ` ${item.name}: ${formatCurrency(item.amount)} (${item.percent}%)`;
              }
            }
          }
        },
        cutout: '65%'
      }
    });
  }

  // 3. Chart Kategori Pemasukan (Doughnut Chart)
  const incCanvas = document.getElementById('statsIncomeCategoryCanvas');
  if (incCanvas && incomeCategories.length > 0 && typeof Chart !== 'undefined') {
    if (incomeCategoryChartInstance) incomeCategoryChartInstance.destroy();

    const colors = incomeCategories.map((_, i) => STATS_CATEGORY_COLORS[(i + 4) % STATS_CATEGORY_COLORS.length]);

    incomeCategoryChartInstance = new Chart(incCanvas, {
      type: 'doughnut',
      data: {
        labels: incomeCategories.map(c => c.name),
        datasets: [{
          data: incomeCategories.map(c => c.amount),
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: isDark ? '#132A23' : '#FFFFFF',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(ctx) {
                const item = incomeCategories[ctx.dataIndex];
                return ` ${item.name}: ${formatCurrency(item.amount)} (${item.percent}%)`;
              }
            }
          }
        },
        cutout: '65%'
      }
    });
  }
}
