// ========================================
// dashboard.js — Dashboard View
// ========================================

// State for active transaction tab: 'all' | 'expense' | 'income'
let currentTxTab = 'all';

function renderDashboard() {
  const wallets = Store.getWallets();
  const totalBalance = Store.getTotalBalance();
  const totalIncome = Store.getTotalIncome();
  const totalExpense = Store.getTotalExpense();
  const netSavings = totalIncome - totalExpense;
  const greeting = getGreeting();
  const settings = Store.getSettings();

  const content = document.getElementById('app-content');
  content.innerHTML = `

    <!-- ======= 1. HEADER: User Profile & Actions ======= -->
    <header class="flex items-center justify-between mb-5">
      <!-- User profile photo & name (klik untuk buka Pengaturan Profil) -->
      <a href="#/settings" class="flex items-center gap-3 group cursor-pointer no-underline">
        <div class="relative">
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face"
            alt="Profile Photo"
            class="w-12 h-12 rounded-full object-cover ring-2 ring-green-400/40 dark:ring-green-600/50 shadow-sm group-hover:scale-105 transition-transform"
          />
          <span class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-lime-400 border-2 border-green-50 dark:border-[#0A1F1B] rounded-full"></span>
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <h1 class="text-lg font-bold text-gray-900 dark:text-green-50 leading-tight group-hover:text-green-600 dark:group-hover:text-lime-300 transition-colors">
              Halo, ${escapeHtml(settings.userName || 'Ridoy')}
            </h1>
            <span class="text-xs">👋</span>
          </div>
          <p class="text-xs text-gray-500 dark:text-green-300/70 font-medium">${greeting} · Kelola dompetmu</p>
        </div>
      </a>

      <!-- Action buttons: Settings + Dark Mode + Notification -->
      <div class="flex items-center gap-1.5">
        <a
          href="#/settings"
          aria-label="Pengaturan Dompet & Kategori"
          title="Pengaturan"
          class="btn-compact w-10 h-10 rounded-full bg-white dark:bg-[#132A23] border border-gray-200 dark:border-[#1F4A3C] flex items-center justify-center text-gray-600 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 transition-all shadow-sm cursor-pointer">
          <i data-lucide="settings" class="w-4 h-4"></i>
        </a>
        <button
          onclick="toggleDarkMode()"
          aria-label="Toggle tema gelap"
          class="btn-compact w-10 h-10 rounded-full bg-white dark:bg-[#132A23] border border-gray-200 dark:border-[#1F4A3C] flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-900/30 transition-all shadow-sm cursor-pointer">
          <i data-lucide="moon" class="w-4 h-4 text-gray-600 dark:text-green-300 dark:hidden"></i>
          <i data-lucide="sun" class="w-4 h-4 text-lime-400 hidden dark:block"></i>
        </button>
        <button
          aria-label="Notifikasi"
          onclick="showNotificationToast()"
          class="btn-compact relative w-10 h-10 rounded-full bg-white dark:bg-[#132A23] border border-gray-200 dark:border-[#1F4A3C] flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-900/30 transition-all shadow-sm cursor-pointer">
          <i data-lucide="bell" class="w-4 h-4 text-gray-600 dark:text-green-300"></i>
          <!-- Notification badge dot -->
          <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#132A23] animate-pulse"></span>
        </button>
      </div>
    </header>

    <!-- ======= 2. SECTION: COMBINED WALLET BALANCE (All Wallets Combined) ======= -->
    <section class="mb-6" aria-labelledby="combined-balance-heading">
      <div class="relative overflow-hidden rounded-[24px] p-5 sm:p-6 bg-gradient-to-br from-green-950 via-green-900 to-green-800 text-white shadow-xl shadow-green-950/25 border border-green-800/40">

        <!-- Top Header & Connected Wallets Tag -->
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-lime-400/20 border border-lime-400/30 flex items-center justify-center">
              <i data-lucide="wallet-cards" class="w-4 h-4 text-lime-300"></i>
            </div>
            <span id="combined-balance-heading" class="text-xs uppercase tracking-wider font-semibold text-green-200/90">
              Total Saldo Gabungan
            </span>
          </div>
          <span class="bg-lime-400/20 border border-lime-400/30 text-lime-300 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <i data-lucide="layers" class="w-3 h-3"></i>
            ${wallets.length} Wallets
          </span>
        </div>

        <!-- Huge Main Combined Balance -->
        <div class="my-2">
          <p class="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums text-white">
            ${formatCurrency(totalBalance)}
          </p>
          <p class="text-[11px] text-green-300/70 mt-0.5">
            Akumulasi seluruh saldo dari ${wallets.length} dompet aktif
          </p>
        </div>

        <!-- Visual Multi-Wallet Proportion Bar -->
        ${renderCombinedProportionBar(wallets, totalBalance)}

        <!-- Quick Financial Metrics Row (Income vs Expense) -->
        <div class="grid grid-cols-2 gap-2.5 pt-3 border-t border-green-800/60 mt-3.5">
          <!-- Total Income -->
          <div class="flex items-center gap-2.5 bg-green-900/40 rounded-xl p-2.5 border border-green-700/30">
            <div class="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <i data-lucide="trending-up" class="w-4 h-4 text-lime-300"></i>
            </div>
            <div class="min-w-0">
              <p class="text-[10px] text-green-200/80 font-medium">Pemasukan</p>
              <p class="text-xs font-bold text-lime-300 tabular-nums truncate">+${formatCurrencyShort(totalIncome)}</p>
            </div>
          </div>

          <!-- Total Expense -->
          <div class="flex items-center gap-2.5 bg-green-900/40 rounded-xl p-2.5 border border-green-700/30">
            <div class="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <i data-lucide="trending-down" class="w-4 h-4 text-red-300"></i>
            </div>
            <div class="min-w-0">
              <p class="text-[10px] text-green-200/80 font-medium">Pengeluaran</p>
              <p class="text-xs font-bold text-red-300 tabular-nums truncate">−${formatCurrencyShort(totalExpense)}</p>
            </div>
          </div>
        </div>

        <!-- Background Ambient Glow Accents -->
        <div class="absolute -top-12 -right-12 w-44 h-44 bg-lime-400/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-16 -left-16 w-48 h-48 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>
    </section>

    <!-- ======= 3. QUICK ACTIONS ======= -->
    <section class="flex justify-around mb-6" aria-label="Aksi Cepat">
      ${renderQuickAction('send', 'Kirim', 'openAddModal(\'transfer\')')}
      ${renderQuickAction('download', 'Terima', 'openAddModal(\'income\')')}
      ${renderQuickAction('plus-circle', 'Isi Saldo', 'openAddModal(\'income\')')}
      ${renderQuickAction('pie-chart', 'Statistik', 'window.location.hash=\'#/weekly\'')}
    </section>

    <!-- ======= 4. INDIVIDUAL WALLETS (Horizontal Scroll) ======= -->
    <section class="mb-6" aria-labelledby="my-wallets-heading">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-1.5">
          <h2 id="my-wallets-heading" class="text-base font-bold text-gray-900 dark:text-green-50">Dompet Saya</h2>
          <span class="text-xs text-gray-400">(${wallets.length})</span>
        </div>
        <a href="#/wallets" class="btn-compact text-xs font-semibold text-green-600 dark:text-lime-400 hover:underline flex items-center gap-1">
          Semua <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
        </a>
      </div>

      ${wallets.length > 0 ? `
        <div class="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
          ${wallets.map(w => renderWalletMiniCard(w)).join('')}
        </div>
      ` : renderEmptyWallets()}
    </section>

    <!-- ======= 5. SECTION: LIST EXPENSE & INCOME DENGAN TABS ======= -->
    <section class="mb-8" aria-labelledby="transaction-section-heading">
      <div class="flex flex-col gap-3 mb-3.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h2 id="transaction-section-heading" class="text-base font-bold text-gray-900 dark:text-green-50 flex items-center gap-1.5">
              <i data-lucide="clock" class="w-4 h-4 text-green-600 dark:text-lime-400"></i>
              <span>Transaksi Hari Ini</span>
            </h2>
            <span class="text-[10px] font-bold text-lime-800 dark:text-lime-300 bg-lime-400/30 dark:bg-lime-900/40 px-2 py-0.5 rounded-full border border-lime-500/20">
              Hari Ini
            </span>
          </div>
          <a href="#/transactions" class="btn-compact text-xs font-semibold text-green-600 dark:text-lime-400 hover:underline flex items-center gap-1">
            Lihat Semua <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
          </a>
        </div>

        <!-- TABS SWITCHER: [Semua] [Pengeluaran / Expense] [Pemasukan / Income] -->
        <div class="bg-gray-200/80 dark:bg-[#132A23] p-1 rounded-2xl flex items-center gap-1 border border-gray-200/50 dark:border-[#1F4A3C]">
          <button
            onclick="switchTxTab('all')"
            id="tab-btn-all"
            class="tab-btn flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${currentTxTab === 'all' ? 'bg-white dark:bg-green-800 text-green-950 dark:text-white shadow-sm font-bold' : 'text-gray-500 dark:text-green-300/60 hover:text-gray-900 dark:hover:text-white'}">
            <i data-lucide="list-filter" class="w-3.5 h-3.5"></i>
            <span>Semua</span>
          </button>

          <button
            onclick="switchTxTab('expense')"
            id="tab-btn-expense"
            class="tab-btn flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${currentTxTab === 'expense' ? 'bg-red-500 text-white shadow-sm font-bold' : 'text-gray-500 dark:text-green-300/60 hover:text-red-500'}">
            <i data-lucide="trending-down" class="w-3.5 h-3.5"></i>
            <span>Pengeluaran</span>
          </button>

          <button
            onclick="switchTxTab('income')"
            id="tab-btn-income"
            class="tab-btn flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${currentTxTab === 'income' ? 'bg-green-600 text-white shadow-sm font-bold' : 'text-gray-500 dark:text-green-300/60 hover:text-green-500'}">
            <i data-lucide="trending-up" class="w-3.5 h-3.5"></i>
            <span>Pemasukan</span>
          </button>
        </div>
      </div>

      <!-- Container Riwayat Transaksi per Tab -->
      <div id="tx-tab-content">
        ${renderTransactionListByTab(currentTxTab)}
      </div>
    </section>
  `;

  // Re-init Lucide icons
  lucide.createIcons();
}

// ========================================
// Sub-components & Helpers
// ========================================

/**
 * Render visual proportion bar for combined balance
 */
function renderCombinedProportionBar(wallets, totalBalance) {
  if (!wallets || wallets.length === 0 || totalBalance <= 0) return '';

  return `
    <div class="mt-3 mb-1">
      <!-- Segmented Bar -->
      <div class="h-2 w-full rounded-full bg-white/10 overflow-hidden flex shadow-inner">
        ${wallets.map(w => {
          const pct = Math.max(3, Math.round(((w.balance || 0) / totalBalance) * 100));
          return `
            <div style="width: ${pct}%; background-color: ${w.color || '#22C55E'}"
                 title="${w.name}: ${formatCurrency(w.balance)}"
                 class="h-full first:rounded-l-full last:rounded-r-full"></div>
          `;
        }).join('')}
      </div>

      <!-- Wallet proportion indicators -->
      <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide mt-2 pt-0.5 text-[10px]">
        ${wallets.slice(0, 4).map(w => {
          const pct = Math.round(((w.balance || 0) / totalBalance) * 100);
          return `
            <span class="inline-flex items-center gap-1 text-white/80 whitespace-nowrap bg-black/20 px-2 py-0.5 rounded-md">
              <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${w.color || '#22C55E'}"></span>
              <span class="font-medium">${w.name}:</span>
              <span class="text-green-200 font-bold">${pct}%</span>
            </span>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * Render quick action circular button
 */
function renderQuickAction(icon, label, actionScript = '') {
  return `
    <button
      onclick="${actionScript}"
      class="flex flex-col items-center gap-1.5 group cursor-pointer">
      <div class="w-12 h-12 rounded-2xl bg-white dark:bg-[#132A23] border border-gray-200/80 dark:border-[#1F4A3C] flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/50 group-hover:border-green-400 group-hover:scale-105 transition-all shadow-sm">
        <i data-lucide="${icon}" class="w-5 h-5 text-green-700 dark:text-green-400"></i>
      </div>
      <span class="text-xs font-semibold text-gray-700 dark:text-green-200 group-hover:text-green-600 transition-colors">${label}</span>
    </button>
  `;
}

/**
 * Render horizontal wallet mini card
 */
function renderWalletMiniCard(wallet) {
  const color = wallet.color || '#14532D';
  const stats = Store.getWalletStats(wallet.id);
  return `
    <div onclick="window.location.hash='#/wallet/${wallet.id}'"
         class="min-w-[165px] snap-start rounded-[20px] p-4 text-white shadow-md flex items-start gap-3 flex-shrink-0 transition-transform hover:-translate-y-0.5 cursor-pointer active:scale-95 group"
         style="background: linear-gradient(135deg, ${color}, ${color}DD); box-shadow: 0 8px 18px -4px ${color}66">
      <div class="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20 group-hover:scale-105 transition-transform">
        <i data-lucide="${wallet.icon || 'wallet'}" class="w-4 h-4 text-white"></i>
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center justify-between gap-1">
          <p class="text-xs text-white/80 font-medium truncate mb-0.5">${escapeHtml(wallet.name)}</p>
          <span class="text-[9px] text-white/70 bg-black/20 px-1.5 py-0.5 rounded">${stats.txCount} tx</span>
        </div>
        <p class="text-lg font-extrabold tabular-nums tracking-tight leading-tight">${formatCurrencyShort(wallet.balance)}</p>
      </div>
    </div>
  `;
}

/**
 * Switch active transaction tab and re-render only the transaction list
 */
function switchTxTab(tab) {
  currentTxTab = tab;

  // Update tab button styles
  const tabs = ['all', 'expense', 'income'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    if (!btn) return;

    if (t === tab) {
      if (t === 'expense') {
        btn.className = 'tab-btn flex-1 py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 bg-red-500 text-white shadow-sm font-bold';
      } else if (t === 'income') {
        btn.className = 'tab-btn flex-1 py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 bg-green-600 text-white shadow-sm font-bold';
      } else {
        btn.className = 'tab-btn flex-1 py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 bg-white dark:bg-green-800 text-green-950 dark:text-white shadow-sm font-bold';
      }
    } else {
      btn.className = 'tab-btn flex-1 py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 text-gray-500 dark:text-green-300/60 hover:text-gray-900 dark:hover:text-white font-medium';
    }
  });

  // Re-render tab content
  const container = document.getElementById('tx-tab-content');
  if (container) {
    container.innerHTML = renderTransactionListByTab(tab);
    lucide.createIcons();
  }
}

/**
 * Render transaction items based on active tab — HANYA TRANSAKSI HARI INI (TODAY)
 */
function renderTransactionListByTab(tab) {
  // Hanya ambil transaksi hari ini
  const transactions = Store.getTodayTransactions(tab);

  if (!transactions || transactions.length === 0) {
    return renderEmptyTransactionsByTab(tab);
  }

  // Summary header for the tab
  const totalAmount = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  let summaryText = '';
  if (tab === 'expense') {
    summaryText = `<span class="text-red-500 font-semibold">Pengeluaran Hari Ini: −${formatCurrency(totalAmount)}</span>`;
  } else if (tab === 'income') {
    summaryText = `<span class="text-green-500 font-semibold">Pemasukan Hari Ini: +${formatCurrency(totalAmount)}</span>`;
  } else {
    summaryText = `<span class="text-gray-500 dark:text-green-300/70 font-medium">Menampilkan ${transactions.length} transaksi hari ini (${formatDateShort(todayISO())})</span>`;
  }

  return `
    <div class="flex items-center justify-between text-xs mb-2.5 px-1">
      <div>${summaryText}</div>
      <span class="text-[11px] font-semibold text-gray-500 dark:text-green-300/80 bg-gray-100 dark:bg-[#1A3B31] px-2 py-0.5 rounded-md">
        ${transactions.length} item hari ini
      </span>
    </div>

    <div class="space-y-2 stagger">
      ${transactions.map(tx => renderTransactionItem(tx)).join('')}
    </div>
  `;
}

/**
 * Render single transaction card item
 */
function renderTransactionItem(tx) {
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
    iconBgClass = 'bg-green-100 dark:bg-green-900/30';
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
    iconBgClass = 'bg-blue-100 dark:bg-blue-900/30';
    iconColorClass = 'text-blue-600 dark:text-blue-400';
    iconName = 'arrow-left-right';
    const toWallet = Store.getWallet(tx.toWalletId);
    subtitle = `Transfer: ${wallet?.name || '?'} → ${toWallet?.name || '?'}`;
  }

  const displayName = tx.itemName || tx.note || category?.name || (tx.type === 'transfer' ? 'Transfer Saldo' : 'Transaksi');
  const timeFormatted = tx.createdAt ? formatTime(tx.createdAt) : '';

  return `
    <div onclick="window.location.hash='#/transaction/${tx.id}'"
         class="flex items-center gap-3 p-3 sm:p-3.5 bg-white dark:bg-[#132A23] rounded-2xl shadow-sm border border-gray-100 dark:border-[#1F4A3C]/60 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md transition-all cursor-pointer group">
      <div class="w-11 h-11 rounded-full ${iconBgClass} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
        <i data-lucide="${iconName}" class="w-5 h-5 ${iconColorClass}"></i>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-gray-900 dark:text-green-50 truncate group-hover:text-green-600 dark:group-hover:text-lime-300 transition-colors">${displayName}</p>
        <p class="text-[11px] text-gray-400 dark:text-green-300/60 truncate">${timeFormatted ? timeFormatted + ' · ' : ''}${subtitle}</p>
      </div>
      <div class="text-right flex-shrink-0 flex items-center gap-1.5">
        <p class="text-sm sm:text-base font-bold ${amountClass} tabular-nums">
          ${amountPrefix}${formatCurrency(tx.amount)}
        </p>
        <i data-lucide="chevron-right" class="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all"></i>
      </div>
    </div>
  `;
}

/**
 * Empty state jika belum ada transaksi hari ini
 */
function renderEmptyTransactionsByTab(tab) {
  let message = 'Belum ada transaksi hari ini';
  let icon = 'calendar-check-2';
  if (tab === 'expense') {
    message = 'Belum ada pengeluaran hari ini';
    icon = 'trending-down';
  } else if (tab === 'income') {
    message = 'Belum ada pemasukan hari ini';
    icon = 'trending-up';
  }

  return `
    <div class="flex flex-col items-center justify-center py-8 px-4 text-center bg-white dark:bg-[#132A23] rounded-2xl shadow-sm border border-dashed border-gray-200 dark:border-[#1F4A3C]">
      <div class="w-12 h-12 rounded-full bg-green-50 dark:bg-green-950/40 flex items-center justify-center mb-2.5">
        <i data-lucide="${icon}" class="w-6 h-6 text-green-600 dark:text-lime-400"></i>
      </div>
      <p class="text-sm font-semibold text-gray-800 dark:text-green-100 mb-1">${message}</p>
      <p class="text-xs text-gray-400 dark:text-green-300/60 mb-3.5 max-w-[240px]">
        Transaksi yang kamu catat hari ini (${formatDateShort(todayISO())}) akan otomatis muncul di sini.
      </p>
      <div class="flex items-center gap-2">
        <button
          onclick="openAddModal('${tab === 'income' ? 'income' : 'expense'}')"
          class="btn-compact text-xs font-semibold px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors shadow-sm flex items-center gap-1.5">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          <span>Catat Sekarang</span>
        </button>
        <a
          href="#/transactions"
          class="btn-compact text-xs font-semibold px-3 py-2 rounded-xl bg-gray-100 dark:bg-[#1A3B31] text-gray-700 dark:text-green-200 hover:bg-gray-200 transition-colors">
          Lihat Semua Riwayat
        </a>
      </div>
    </div>
  `;
}

function renderEmptyWallets() {
  return `
    <div class="flex flex-col items-center justify-center py-8 px-6 text-center bg-white dark:bg-[#132A23] rounded-2xl shadow-sm border border-gray-100 dark:border-[#1F4A3C]">
      <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
        <i data-lucide="wallet" class="w-6 h-6 text-green-500"></i>
      </div>
      <p class="text-sm font-semibold text-gray-900 dark:text-green-50">Belum ada wallet</p>
      <p class="text-xs text-gray-400 dark:text-green-300/60 mb-3">Buat wallet pertamamu untuk mulai mencatat</p>
      <a href="#/settings" class="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1">
        <i data-lucide="plus" class="w-3.5 h-3.5"></i> Buat Wallet
      </a>
    </div>
  `;
}

// Simple toast feedback
function showNotificationToast() {
  const existing = document.getElementById('pw-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'pw-toast';
  toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg border border-green-700 animate-scale-pop flex items-center gap-2';
  toast.innerHTML = `<i data-lucide="bell" class="w-4 h-4 text-lime-400"></i> Tidak ada notifikasi baru`;
  document.body.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.remove();
  }, 2500);
}

// Global Dark Mode toggle
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  const settings = Store.getSettings();
  settings.darkMode = document.documentElement.classList.contains('dark');
  Store.saveSettings(settings);

  if (App.currentView === 'dashboard') {
    renderDashboard();
  } else if (App.currentView === 'wallets') {
    renderWallets();
  } else if (App.currentView === 'stats') {
    renderStats();
  }
}
