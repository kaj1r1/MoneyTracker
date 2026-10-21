// ========================================
// transactions.js — Halaman Semua Transaksi
// ========================================

// Filter state
let txFilterState = {
  datePreset: 'all',    // 'all' | 'today' | '7days' | 'thisMonth' | 'lastMonth' | 'custom'
  startDate: '',
  endDate: '',
  type: 'all',          // 'all' | 'expense' | 'income' | 'transfer'
  walletId: 'all',
  categoryId: 'all',
  search: '',
  showCustomDate: false,
};

/**
 * Render Halaman Semua Transaksi
 */
function renderTransactions() {
  const content = document.getElementById('app-content');
  if (!content) return;

  const wallets = Store.getWallets();
  const allCategories = Store.getCategories();
  const relevantCategories = txFilterState.type === 'expense'
    ? Store.getCategoriesByType('expense')
    : (txFilterState.type === 'income'
        ? Store.getCategoriesByType('income')
        : allCategories);

  const filteredTxs = Store.filterTransactions(txFilterState);

  // Hitung ringkasan transaksi terfilter
  const totalIncome = filteredTxs
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpense = filteredTxs
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const netCashflow = totalIncome - totalExpense;

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
          <h1 class="text-xl font-bold text-gray-900 dark:text-green-50 leading-tight">Semua Transaksi</h1>
          <p class="text-xs text-gray-400 dark:text-green-300/60 font-medium">Riwayat & filter keuangan lengkap</p>
        </div>
      </div>

      <!-- Reset Filter Button -->
      <button
        onclick="resetTxFilters()"
        class="btn-compact text-xs font-semibold text-green-700 dark:text-lime-400 bg-green-100 dark:bg-green-900/40 hover:bg-green-200 dark:hover:bg-green-800/60 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors">
        <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
        <span>Reset</span>
      </button>
    </header>

    <!-- ======= 2. SEARCH BAR ======= -->
    <div class="relative mb-3.5">
      <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <i data-lucide="search" class="w-4 h-4"></i>
      </span>
      <input
        type="text"
        id="txSearchInput"
        value="${escapeHtml(txFilterState.search)}"
        oninput="handleTxSearch(this.value)"
        placeholder="Cari transaksi, toko, catatan..."
        class="w-full h-11 pl-10 pr-9 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#132A23] text-gray-900 dark:text-green-50 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors shadow-sm"
      />
      ${txFilterState.search ? `
        <button
          onclick="clearTxSearch()"
          class="btn-compact absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      ` : ''}
    </div>

    <!-- ======= 3. FILTER TANGGAL (DATE RANGE CHIPS & CUSTOM PICKER) ======= -->
    <div class="bg-white dark:bg-[#132A23] rounded-2xl p-3 mb-4 shadow-sm border border-gray-100 dark:border-[#1F4A3C]">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-green-200">
          <i data-lucide="calendar" class="w-4 h-4 text-green-600 dark:text-lime-400"></i>
          <span>Filter Rentang Tanggal</span>
        </div>
        ${getActiveDateLabel() ? `
          <span class="text-[10px] font-semibold text-green-700 dark:text-lime-300 bg-green-50 dark:bg-green-950/60 px-2 py-0.5 rounded-md border border-green-200 dark:border-green-800">
            ${getActiveDateLabel()}
          </span>
        ` : ''}
      </div>

      <!-- Date Preset Chips -->
      <div class="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        ${renderDateChip('all', 'Semua')}
        ${renderDateChip('today', 'Hari Ini')}
        ${renderDateChip('7days', '7 Hari')}
        ${renderDateChip('thisMonth', 'Bulan Ini')}
        ${renderDateChip('lastMonth', 'Bulan Lalu')}
        ${renderDateChip('custom', 'Kustom...', true)}
      </div>

      <!-- Custom Date Input Box (Visible when 'custom' is active or toggled) -->
      <div id="customDateRangeBox" class="${txFilterState.datePreset === 'custom' || txFilterState.showCustomDate ? 'block' : 'hidden'} mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div class="grid grid-cols-2 gap-2 mb-2.5">
          <div>
            <label class="block text-[10px] font-bold text-gray-500 dark:text-green-300/60 uppercase mb-1">Dari Tanggal</label>
            <input
              type="date"
              id="customStartDate"
              value="${txFilterState.startDate || ''}"
              onchange="handleCustomDateChange()"
              class="w-full h-10 px-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A3B31] text-xs text-gray-900 dark:text-green-50 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-500 dark:text-green-300/60 uppercase mb-1">Sampai Tanggal</label>
            <input
              type="date"
              id="customEndDate"
              value="${txFilterState.endDate || ''}"
              onchange="handleCustomDateChange()"
              class="w-full h-10 px-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A3B31] text-xs text-gray-900 dark:text-green-50 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>
        </div>
        <div class="flex items-center justify-end gap-2">
          <button
            onclick="applyCustomDate()"
            class="btn-compact text-xs font-semibold bg-green-600 hover:bg-green-700 text-white px-3.5 py-1.5 rounded-xl shadow-sm transition-colors flex items-center gap-1">
            <i data-lucide="check" class="w-3.5 h-3.5"></i>
            <span>Terapkan Tanggal</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ======= 4. SECONDARY FILTERS: TYPE, WALLET & KATEGORI ======= -->
    <div class="space-y-2 mb-4">
      <!-- Type Segmented Pills -->
      <div class="bg-gray-200/80 dark:bg-[#132A23] p-1 rounded-2xl flex items-center gap-1 border border-gray-200/60 dark:border-[#1F4A3C]">
        ${renderTypeButton('all', 'Semua')}
        ${renderTypeButton('expense', 'Keluar', 'trending-down')}
        ${renderTypeButton('income', 'Masuk', 'trending-up')}
        ${renderTypeButton('transfer', 'Transfer', 'arrow-left-right')}
      </div>

      <!-- Wallet & Kategori Filter Dropdowns (2 Kolom) -->
      <div class="grid grid-cols-2 gap-2">
        <!-- 1. Wallet Filter Dropdown -->
        <div class="relative">
          <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-green-300/60 pointer-events-none">
            <i data-lucide="wallet" class="w-3.5 h-3.5"></i>
          </span>
          <select
            id="txWalletFilterSelect"
            onchange="handleWalletFilter(this.value)"
            class="w-full h-10 pl-7 pr-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#132A23] text-gray-800 dark:text-green-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-colors shadow-xs truncate">
            <option value="all">Semua Wallet</option>
            ${wallets.map(w => `
              <option value="${w.id}" ${txFilterState.walletId === w.id ? 'selected' : ''}>${w.name}</option>
            `).join('')}
          </select>
        </div>

        <!-- 2. Category Filter Dropdown -->
        <div class="relative">
          <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-green-300/60 pointer-events-none">
            <i data-lucide="tag" class="w-3.5 h-3.5"></i>
          </span>
          <select
            id="txCategoryFilterSelect"
            onchange="handleCategoryFilter(this.value)"
            class="w-full h-10 pl-7 pr-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#132A23] text-gray-800 dark:text-green-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-colors shadow-xs truncate">
            <option value="all">Semua Kategori</option>
            ${txFilterState.type === 'all' ? `
              <optgroup label="Pengeluaran">
                ${allCategories.filter(c => c.type === 'expense').map(c => `
                  <option value="${c.id}" ${txFilterState.categoryId === c.id ? 'selected' : ''}>${c.name}</option>
                `).join('')}
              </optgroup>
              <optgroup label="Pemasukan">
                ${allCategories.filter(c => c.type === 'income').map(c => `
                  <option value="${c.id}" ${txFilterState.categoryId === c.id ? 'selected' : ''}>${c.name}</option>
                `).join('')}
              </optgroup>
            ` : `
              ${relevantCategories.map(c => `
                <option value="${c.id}" ${txFilterState.categoryId === c.id ? 'selected' : ''}>${c.name}</option>
              `).join('')}
            `}
          </select>
        </div>
      </div>
    </div>

    <!-- ======= 5. RINGKASAN TRANSAKSI TERFILTER ======= -->
    <div class="bg-gradient-to-br from-green-900 via-green-800 to-green-700 rounded-2xl p-4 text-white shadow-md mb-5 relative overflow-hidden">
      <div class="flex items-center justify-between mb-2">
        <p class="text-xs font-semibold text-green-200 uppercase tracking-wider">Ringkasan Terfilter</p>
        <span class="text-xs font-bold text-lime-300 bg-green-950/40 px-2 py-0.5 rounded-full">
          ${filteredTxs.length} Transaksi
        </span>
      </div>

      <div class="grid grid-cols-3 gap-2 text-center pt-1">
        <div class="bg-black/20 rounded-xl p-2">
          <p class="text-[10px] text-green-200/80 mb-0.5 font-medium">Pemasukan</p>
          <p class="text-xs sm:text-sm font-extrabold text-lime-300 tabular-nums truncate">
            +${formatCurrencyShort(totalIncome)}
          </p>
        </div>
        <div class="bg-black/20 rounded-xl p-2">
          <p class="text-[10px] text-green-200/80 mb-0.5 font-medium">Pengeluaran</p>
          <p class="text-xs sm:text-sm font-extrabold text-red-300 tabular-nums truncate">
            −${formatCurrencyShort(totalExpense)}
          </p>
        </div>
        <div class="bg-black/20 rounded-xl p-2">
          <p class="text-[10px] text-green-200/80 mb-0.5 font-medium">Arus Kas (Net)</p>
          <p class="text-xs sm:text-sm font-extrabold tabular-nums truncate ${netCashflow >= 0 ? 'text-lime-300' : 'text-red-300'}">
            ${netCashflow >= 0 ? '+' : '−'}${formatCurrencyShort(Math.abs(netCashflow))}
          </p>
        </div>
      </div>
    </div>

    <!-- ======= 6. DAFTAR TRANSAKSI (GROUPED BY DATE) ======= -->
    <section aria-label="Daftar Transaksi">
      ${renderGroupedTransactionList(filteredTxs)}
    </section>

    <!-- ======= 7. MODAL KONFIRMASI HAPUS TRANSAKSI ======= -->
    <div id="deleteTxModalOverlay" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 hidden opacity-0 transition-opacity duration-200 flex items-center justify-center p-4">
      <div onclick="closeDeleteTxConfirmModal()" class="absolute inset-0"></div>
      <div id="deleteTxModalBox" class="relative w-full max-w-xs bg-white dark:bg-[#132A23] rounded-3xl p-5 shadow-2xl border border-gray-100 dark:border-[#1F4A3C] scale-95 transition-transform duration-200 z-10 text-center">
        <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-500 mx-auto flex items-center justify-center mb-3">
          <i data-lucide="trash-2" class="w-6 h-6"></i>
        </div>
        <h4 class="text-base font-bold text-gray-900 dark:text-green-50 mb-1">Hapus Transaksi?</h4>
        <p id="deleteTxModalDesc" class="text-xs text-gray-400 dark:text-green-300/60 mb-4 px-1 leading-relaxed">
          Transaksi ini akan dihapus dan saldo dompet akan disesuaikan kembali.
        </p>
        <div class="flex gap-2">
          <button
            type="button"
            onclick="closeDeleteTxConfirmModal()"
            class="btn-compact flex-1 py-2.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-[#1A3B31] text-gray-700 dark:text-green-200 hover:bg-gray-200 transition-colors cursor-pointer">
            Batal
          </button>
          <button
            type="button"
            id="confirmDeleteTxBtn"
            class="btn-compact flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-md shadow-red-500/30 transition-all cursor-pointer">
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  `;

  // Inisialisasi ikon Lucide
  lucide.createIcons();
}

// ========================================
// Helper Render Functions
// ========================================

/**
 * Render chip filter tanggal
 */
function renderDateChip(presetKey, label, isCustom = false) {
  const isActive = txFilterState.datePreset === presetKey;

  const activeClasses = 'bg-green-600 text-white font-bold shadow-sm';
  const inactiveClasses = 'bg-gray-100 dark:bg-[#1A3B31] text-gray-600 dark:text-green-300/80 hover:bg-gray-200 dark:hover:bg-green-900/40 font-medium';

  return `
    <button
      onclick="setDatePreset('${presetKey}')"
      class="tab-btn px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all flex items-center gap-1 ${isActive ? activeClasses : inactiveClasses}">
      ${isCustom ? '<i data-lucide="calendar-range" class="w-3 h-3"></i>' : ''}
      <span>${label}</span>
    </button>
  `;
}

/**
 * Render tombol segmented tipe transaksi
 */
function renderTypeButton(typeKey, label, icon = '') {
  const isActive = txFilterState.type === typeKey;

  let activeClass = 'bg-white dark:bg-green-800 text-green-950 dark:text-white shadow-sm font-bold';
  if (isActive && typeKey === 'expense') activeClass = 'bg-red-500 text-white shadow-sm font-bold';
  if (isActive && typeKey === 'income') activeClass = 'bg-green-600 text-white shadow-sm font-bold';
  if (isActive && typeKey === 'transfer') activeClass = 'bg-blue-600 text-white shadow-sm font-bold';

  const inactiveClass = 'text-gray-500 dark:text-green-300/60 hover:text-gray-900 dark:hover:text-white font-medium';

  return `
    <button
      onclick="setTxType('${typeKey}')"
      class="tab-btn flex-1 py-1.5 px-2 rounded-xl text-[11px] transition-all flex items-center justify-center gap-1 ${isActive ? activeClass : inactiveClass}">
      ${icon ? `<i data-lucide="${icon}" class="w-3 h-3"></i>` : ''}
      <span>${label}</span>
    </button>
  `;
}

/**
 * Dapatkan label teks tanggal aktif
 */
function getActiveDateLabel() {
  if (txFilterState.datePreset === 'today') return formatDate(todayISO());
  if (txFilterState.datePreset === '7days') return `${formatDateShort(daysAgoISO(7))} — ${formatDateShort(todayISO())}`;
  if (txFilterState.datePreset === 'thisMonth') return `${formatDateShort(startOfMonthISO())} — ${formatDateShort(endOfMonthISO())}`;
  if (txFilterState.datePreset === 'lastMonth') return `${formatDateShort(startOfLastMonthISO())} — ${formatDateShort(endOfLastMonthISO())}`;
  if (txFilterState.datePreset === 'custom' && txFilterState.startDate && txFilterState.endDate) {
    return `${formatDateShort(txFilterState.startDate)} — ${formatDateShort(txFilterState.endDate)}`;
  }
  return '';
}

/**
 * Render daftar transaksi dikelompokkan berdasarkan tanggal
 */
function renderGroupedTransactionList(transactions) {
  if (!transactions || transactions.length === 0) {
    return `
      <div class="flex flex-col items-center justify-center py-12 px-6 text-center bg-white dark:bg-[#132A23] rounded-2xl shadow-sm border border-dashed border-gray-200 dark:border-[#1F4A3C]">
        <div class="w-14 h-14 rounded-full bg-green-50 dark:bg-green-950/40 flex items-center justify-center mb-3">
          <i data-lucide="calendar-x" class="w-7 h-7 text-green-600 dark:text-lime-400"></i>
        </div>
        <h3 class="text-base font-bold text-gray-900 dark:text-green-50 mb-1">Tidak Ada Transaksi</h3>
        <p class="text-xs text-gray-400 dark:text-green-300/60 max-w-xs mb-4">
          Tidak ditemukan riwayat transaksi untuk filter dan rentang tanggal yang dipilih.
        </p>
        <button
          onclick="resetTxFilters()"
          class="btn-compact text-xs font-semibold bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-1.5">
          <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
          <span>Reset Semua Filter</span>
        </button>
      </div>
    `;
  }

  // Kelompokkan transaksi berdasarkan tanggal (YYYY-MM-DD)
  const grouped = {};
  transactions.forEach(tx => {
    const d = tx.date || (tx.createdAt ? tx.createdAt.slice(0, 10) : 'Lainnya');
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(tx);
  });

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  return `
    <div class="space-y-4">
      ${sortedDates.map(dateKey => {
        const txsOnDate = grouped[dateKey];
        const dayTotal = txsOnDate.reduce((sum, t) => {
          if (t.type === 'income') return sum + Number(t.amount);
          if (t.type === 'expense') return sum - Number(t.amount);
          return sum;
        }, 0);

        return `
          <div>
            <!-- Date Group Header -->
            <div class="flex items-center justify-between px-1 mb-2">
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-bold text-gray-700 dark:text-green-200">
                  ${formatDateGroupHeader(dateKey)}
                </span>
                <span class="text-[10px] text-gray-400 font-medium">
                  (${formatDate(dateKey)})
                </span>
              </div>
              <span class="text-[11px] font-bold tabular-nums ${dayTotal >= 0 ? 'text-green-600 dark:text-lime-400' : 'text-red-500'}">
                ${dayTotal >= 0 ? '+' : '−'}${formatCurrencyShort(Math.abs(dayTotal))}
              </span>
            </div>

            <!-- Transaction Items for this date -->
            <div class="space-y-2 stagger">
              ${txsOnDate.map(tx => renderTransactionRow(tx)).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Render single baris item transaksi
 */
function renderTransactionRow(tx) {
  const category = Store.getCategory(tx.categoryId);
  const wallet = Store.getWallet(tx.walletId);

  let amountClass = 'text-gray-900 dark:text-white';
  let amountPrefix = '';
  let iconBgClass = 'bg-gray-100 dark:bg-gray-800';
  let iconColorClass = 'text-gray-600 dark:text-gray-300';
  let iconName = 'receipt';
  let subtitle = `${wallet?.name || 'Wallet'} · ${category?.name || 'Umum'}`;

  if (tx.type === 'income') {
    amountClass = 'text-green-600 dark:text-green-400';
    amountPrefix = '+';
    iconBgClass = 'bg-green-100 dark:bg-green-950/50';
    iconColorClass = 'text-green-600 dark:text-green-400';
    iconName = category?.icon || 'trending-up';
    subtitle = `${wallet?.name || 'Wallet'} · ${category?.name || 'Pemasukan'}`;
  } else if (tx.type === 'expense') {
    amountClass = 'text-red-600 dark:text-red-400';
    amountPrefix = '−';
    iconBgClass = getCategoryBgColor(category?.icon);
    iconColorClass = getCategoryIconColor(category?.icon);
    iconName = category?.icon || 'shopping-bag';
    subtitle = `${wallet?.name || 'Wallet'} · ${category?.name || 'Pengeluaran'}`;
  } else if (tx.type === 'transfer') {
    amountClass = 'text-blue-600 dark:text-blue-400';
    amountPrefix = '';
    iconBgClass = 'bg-blue-100 dark:bg-blue-950/50';
    iconColorClass = 'text-blue-600 dark:text-blue-400';
    iconName = 'arrow-left-right';
    const toWallet = Store.getWallet(tx.toWalletId);
    subtitle = `Transfer: ${wallet?.name || '?'} → ${toWallet?.name || '?'}`;
  }

  const displayName = tx.itemName || tx.note || category?.name || (tx.type === 'transfer' ? 'Transfer Saldo' : 'Transaksi');
  const timeFormatted = tx.createdAt ? formatTime(tx.createdAt) : '';

  return `
    <div onclick="window.location.hash='#/transaction/${tx.id}'"
         class="group flex items-center justify-between p-3 sm:p-3.5 bg-white dark:bg-[#132A23] rounded-2xl shadow-sm border border-gray-100 dark:border-[#1F4A3C]/70 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md transition-all cursor-pointer">
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <!-- Category Icon -->
        <div class="w-11 h-11 rounded-2xl ${iconBgClass} flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
          <i data-lucide="${iconName}" class="w-5 h-5 ${iconColorClass}"></i>
        </div>

        <!-- Info -->
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-gray-900 dark:text-green-50 truncate group-hover:text-green-600 dark:group-hover:text-lime-300 transition-colors">${escapeHtml(displayName)}</p>
          <div class="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-green-300/60 truncate mt-0.5">
            ${timeFormatted ? `<span>${timeFormatted}</span><span>•</span>` : ''}
            <span>${escapeHtml(subtitle)}</span>
          </div>
        </div>
      </div>

      <!-- Amount & Actions -->
      <div class="flex items-center gap-2 pl-2 flex-shrink-0">
        <span class="text-sm sm:text-base font-bold ${amountClass} tabular-nums">
          ${amountPrefix}${formatCurrency(tx.amount)}
        </span>

        <!-- Tombol Edit Transaksi -->
        <button
          type="button"
          onclick="event.stopPropagation(); openEditTxModal('${tx.id}')"
          aria-label="Edit Transaksi"
          title="Edit Transaksi"
          class="btn-compact w-8 h-8 rounded-xl bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-lime-400 hover:bg-green-600 hover:text-white border border-green-200/70 dark:border-green-800/50 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95">
          <i data-lucide="pencil" class="w-4 h-4"></i>
        </button>

        <!-- Tombol Hapus Transaksi (Jelas & Prominen) -->
        <button
          type="button"
          onclick="event.stopPropagation(); openDeleteTxConfirmModal('${tx.id}', '${escapeHtml(displayName)}')"
          aria-label="Hapus Transaksi"
          title="Hapus Transaksi"
          class="btn-compact w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-500 hover:bg-red-500 hover:text-white border border-red-200/70 dark:border-red-900/50 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>

        <i data-lucide="chevron-right" class="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all"></i>
      </div>
    </div>
  `;
}

// ========================================
// Filter Event Handlers
// ========================================

/**
 * Ubah preset filter tanggal
 */
function setDatePreset(presetKey) {
  txFilterState.datePreset = presetKey;

  const today = todayISO();

  if (presetKey === 'all') {
    txFilterState.startDate = '';
    txFilterState.endDate = '';
    txFilterState.showCustomDate = false;
  } else if (presetKey === 'today') {
    txFilterState.startDate = today;
    txFilterState.endDate = today;
    txFilterState.showCustomDate = false;
  } else if (presetKey === '7days') {
    txFilterState.startDate = daysAgoISO(7);
    txFilterState.endDate = today;
    txFilterState.showCustomDate = false;
  } else if (presetKey === 'thisMonth') {
    txFilterState.startDate = startOfMonthISO();
    txFilterState.endDate = endOfMonthISO();
    txFilterState.showCustomDate = false;
  } else if (presetKey === 'lastMonth') {
    txFilterState.startDate = startOfLastMonthISO();
    txFilterState.endDate = endOfLastMonthISO();
    txFilterState.showCustomDate = false;
  } else if (presetKey === 'custom') {
    txFilterState.showCustomDate = true;
    if (!txFilterState.startDate) txFilterState.startDate = daysAgoISO(30);
    if (!txFilterState.endDate) txFilterState.endDate = today;
  }

  renderTransactions();
}

/**
 * Handle custom date inputs change
 */
function handleCustomDateChange() {
  const start = document.getElementById('customStartDate')?.value;
  const end = document.getElementById('customEndDate')?.value;
  if (start) txFilterState.startDate = start;
  if (end) txFilterState.endDate = end;
}

/**
 * Terapkan custom date range
 */
function applyCustomDate() {
  handleCustomDateChange();
  txFilterState.datePreset = 'custom';
  renderTransactions();
}

/**
 * Ubah filter tipe transaksi
 */
function setTxType(typeKey) {
  txFilterState.type = typeKey;
  // Jika kategori sebelumnya tidak cocok dengan tipe baru, reset ke 'all'
  if (txFilterState.categoryId !== 'all') {
    const cat = Store.getCategory(txFilterState.categoryId);
    if (cat && typeKey !== 'all' && cat.type !== typeKey) {
      txFilterState.categoryId = 'all';
    }
  }
  renderTransactions();
}

/**
 * Ubah filter wallet
 */
function handleWalletFilter(walletId) {
  txFilterState.walletId = walletId;
  renderTransactions();
}

/**
 * Ubah filter kategori
 */
function handleCategoryFilter(categoryId) {
  txFilterState.categoryId = categoryId;
  renderTransactions();
}

/**
 * Search input handler
 */
function handleTxSearch(value) {
  txFilterState.search = value;
  renderTransactions();
}

/**
 * Bersihkan search
 */
function clearTxSearch() {
  txFilterState.search = '';
  renderTransactions();
}

/**
 * Reset semua filter ke default
 */
function resetTxFilters() {
  txFilterState = {
    datePreset: 'all',
    startDate: '',
    endDate: '',
    type: 'all',
    walletId: 'all',
    categoryId: 'all',
    search: '',
    showCustomDate: false,
  };
  renderTransactions();
}

let pendingDeleteTxId = null;

/**
 * Buka modal konfirmasi hapus transaksi
 */
function openDeleteTxConfirmModal(txId, displayName) {
  pendingDeleteTxId = txId;
  const overlay = document.getElementById('deleteTxModalOverlay');
  const box = document.getElementById('deleteTxModalBox');
  const desc = document.getElementById('deleteTxModalDesc');
  const confirmBtn = document.getElementById('confirmDeleteTxBtn');
  if (!overlay || !box) return;

  if (desc) {
    desc.innerHTML = `Transaksi <strong>"${escapeHtml(displayName)}"</strong> akan dihapus dan saldo dompet terkait akan disesuaikan kembali.`;
  }

  if (confirmBtn) {
    confirmBtn.onclick = () => executeDeleteTx(txId);
  }

  overlay.classList.remove('hidden');
  setTimeout(() => {
    overlay.classList.remove('opacity-0');
    box.classList.remove('scale-95');
    box.classList.add('scale-100');
  }, 10);

  lucide.createIcons();
}

/**
 * Tutup modal konfirmasi hapus
 */
function closeDeleteTxConfirmModal() {
  const overlay = document.getElementById('deleteTxModalOverlay');
  const box = document.getElementById('deleteTxModalBox');
  if (!overlay || !box) return;

  box.classList.remove('scale-100');
  box.classList.add('scale-95');
  overlay.classList.add('opacity-0');
  setTimeout(() => overlay.classList.add('hidden'), 200);
  pendingDeleteTxId = null;
}

/**
 * Eksekusi hapus transaksi setelah dikonfirmasi
 */
function executeDeleteTx(txId) {
  closeDeleteTxConfirmModal();
  Store.deleteTransaction(txId);
  renderTransactions();

  // Tampilkan toast konfirmasi
  const toast = document.createElement('div');
  toast.id = 'pw-toast';
  toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg border border-green-700 animate-scale-pop flex items-center gap-2';
  toast.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-lime-400"></i> Transaksi berhasil dihapus dan saldo diperbarui`;
  document.body.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => toast.remove(), 2500);
}

/**
 * Utility escape HTML
 */
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}
