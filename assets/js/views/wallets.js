// ========================================
// wallets.js — Halaman Daftar Detail Transaksi Setiap Wallet
// ========================================

let activeWalletFilterId = 'all'; // 'all' atau wallet.id tertentu
let activeWalletTypeFilter = 'all'; // 'all' | 'expense' | 'income' | 'transfer'

/**
 * Render Halaman Wallets Utama
 */
function renderWallets() {
  const content = document.getElementById('app-content');
  if (!content) return;

  const wallets = Store.getWallets();
  const totalBalance = Store.getTotalBalance();

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
          <h1 class="text-xl font-bold text-gray-900 dark:text-green-50 leading-tight">Dompet Saya</h1>
          <p class="text-xs text-gray-400 dark:text-green-300/60 font-medium">Daftar detail transaksi setiap dompet</p>
        </div>
      </div>

      <!-- Quick Action: Kelola di Pengaturan -->
      <a href="#/settings"
         title="Kelola & Tambah Dompet"
         class="btn-compact w-10 h-10 rounded-full bg-white dark:bg-[#132A23] border border-gray-200 dark:border-[#1F4A3C] flex items-center justify-center text-gray-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors shadow-sm">
        <i data-lucide="sliders-horizontal" class="w-4 h-4"></i>
      </a>
    </header>

    <!-- ======= 2. TOTAL OVERVIEW BANNER ======= -->
    <div class="p-4 sm:p-5 rounded-[24px] bg-gradient-to-br from-green-950 via-green-900 to-green-800 text-white shadow-lg border border-green-800/40 mb-4 relative overflow-hidden">
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-xs font-semibold text-green-200/90 uppercase tracking-wider">Total Seluruh Dompet</span>
        <span class="text-[11px] font-bold bg-lime-400/20 text-lime-300 border border-lime-400/30 px-2.5 py-0.5 rounded-full">
          ${wallets.length} Dompet Aktif
        </span>
      </div>
      <p class="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-white">
        ${formatCurrency(totalBalance)}
      </p>

      <div class="flex items-center gap-2 mt-3.5 pt-3 border-t border-green-800/60">
        <button
          onclick="openAddModal('expense')"
          class="btn-compact flex-1 py-2 px-3 rounded-xl bg-lime-400 hover:bg-lime-500 text-green-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm">
          <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i>
          <span>Catat Transaksi</span>
        </button>
        <button
          onclick="openAddModal('transfer')"
          class="btn-compact flex-1 py-2 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all">
          <i data-lucide="arrow-left-right" class="w-3.5 h-3.5 text-lime-300"></i>
          <span>Transfer Saldo</span>
        </button>
      </div>

      <!-- Ambient glow -->
      <div class="absolute -top-10 -right-10 w-36 h-36 bg-lime-400/15 rounded-full blur-2xl pointer-events-none"></div>
    </div>

    <!-- ======= 3. WALLET SELECTOR TABS ======= -->
    <div class="mb-4">
      <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        <button
          onclick="switchWalletViewFilter('all')"
          class="btn-compact px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${activeWalletFilterId === 'all' ? 'bg-green-600 text-white shadow-sm' : 'bg-white dark:bg-[#132A23] text-gray-600 dark:text-green-200 border border-gray-200/80 dark:border-[#1F4A3C]'}">
          <i data-lucide="layers" class="w-3.5 h-3.5"></i>
          <span>Semua Dompet</span>
        </button>

        ${wallets.map(w => {
          const isActive = activeWalletFilterId === w.id;
          const color = w.color || '#14532D';
          return `
            <button
              onclick="switchWalletViewFilter('${w.id}')"
              class="btn-compact px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${isActive ? 'bg-green-600 text-white shadow-sm' : 'bg-white dark:bg-[#132A23] text-gray-700 dark:text-green-200 border border-gray-200/80 dark:border-[#1F4A3C]'}">
              <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${color}"></span>
              <span>${escapeHtml(w.name)}</span>
              <span class="text-[10px] opacity-80 tabular-nums">(${formatCurrencyShort(w.balance)})</span>
            </button>
          `;
        }).join('')}
      </div>
    </div>

    <!-- ======= 4. KONTEN DETAIL TRANSAKSI ======= -->
    <div id="wallets-view-content" class="space-y-5">
      ${activeWalletFilterId === 'all' ? renderAllWalletsSections(wallets) : renderSingleWalletDetailedSection(activeWalletFilterId)}
    </div>
  `;

  lucide.createIcons();
}

/**
 * Ganti wallet terpilih di halaman Wallets
 */
function switchWalletViewFilter(walletId) {
  activeWalletFilterId = walletId;
  activeWalletTypeFilter = 'all';
  renderWallets();
}

/**
 * Ganti tab tipe transaksi untuk single wallet view
 */
function switchWalletViewTypeFilter(type) {
  activeWalletTypeFilter = type;
  const container = document.getElementById('wallets-view-content');
  if (container && activeWalletFilterId !== 'all') {
    container.innerHTML = renderSingleWalletDetailedSection(activeWalletFilterId);
    lucide.createIcons();
  }
}

/**
 * Render semua dompet masing-masing beserta daftar detail transaksinya
 */
function renderAllWalletsSections(wallets) {
  if (!wallets || wallets.length === 0) {
    return `
      <div class="py-12 px-4 text-center bg-white dark:bg-[#132A23] rounded-2xl border border-dashed border-gray-200 dark:border-[#1F4A3C]">
        <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-lime-400 flex items-center justify-center mx-auto mb-2.5">
          <i data-lucide="wallet" class="w-6 h-6"></i>
        </div>
        <p class="text-sm font-bold text-gray-900 dark:text-green-50">Belum Ada Dompet</p>
        <p class="text-xs text-gray-400 mb-4">Tambahkan dompet pertamamu di menu Pengaturan.</p>
        <a href="#/settings" class="btn-compact text-xs font-bold bg-green-600 text-white px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 shadow-sm">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i> Tambah Dompet
        </a>
      </div>
    `;
  }

  return wallets.map(wallet => {
    const color = wallet.color || '#14532D';
    const stats = Store.getWalletStats(wallet.id);
    const transactions = Store.getWalletTransactions(wallet.id, 'all');

    return `
      <div class="bg-white dark:bg-[#132A23] rounded-[24px] p-4 sm:p-5 border border-gray-100 dark:border-[#1F4A3C] shadow-sm">
        <!-- Header Kartu Dompet -->
        <div class="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-[#1F4A3C]/70">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-11 h-11 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-sm"
                 style="background: linear-gradient(135deg, ${color}, ${color}EE)">
              <i data-lucide="${wallet.icon || 'wallet'}" class="w-5 h-5"></i>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5">
                <h3 class="text-base font-bold text-gray-900 dark:text-green-50 truncate">${escapeHtml(wallet.name)}</h3>
                <span class="text-[10px] font-semibold text-gray-500 dark:text-green-300/80 bg-gray-100 dark:bg-[#1A3B31] px-1.5 py-0.5 rounded-md">
                  ${stats.txCount} tx
                </span>
              </div>
              <p class="text-sm font-extrabold text-green-700 dark:text-lime-300 tabular-nums">
                ${formatCurrency(wallet.balance)}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1 flex-shrink-0">
            <button
              onclick="openAddModal('expense', '${wallet.id}')"
              title="Tambah Transaksi di Dompet Ini"
              class="btn-compact w-8 h-8 rounded-xl bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-lime-400 hover:bg-green-100 dark:hover:bg-green-900/60 flex items-center justify-center transition-colors">
              <i data-lucide="plus" class="w-4 h-4"></i>
            </button>
            <button
              onclick="switchWalletViewFilter('${wallet.id}')"
              title="Buka Detail Penuh"
              class="btn-compact text-xs font-semibold text-green-600 dark:text-lime-400 hover:underline px-2 py-1">
              Fokus
            </button>
          </div>
        </div>

        <!-- Ringkasan Masuk & Keluar Dompet Ini -->
        <div class="grid grid-cols-2 gap-2 my-3 text-xs">
          <div class="bg-gray-50 dark:bg-[#1A3B31] p-2 rounded-xl flex items-center justify-between">
            <span class="text-gray-400 flex items-center gap-1">
              <i data-lucide="trending-up" class="w-3.5 h-3.5 text-green-500"></i> Masuk
            </span>
            <span class="font-bold text-green-600 dark:text-lime-400 tabular-nums">+${formatCurrencyShort(stats.income)}</span>
          </div>
          <div class="bg-gray-50 dark:bg-[#1A3B31] p-2 rounded-xl flex items-center justify-between">
            <span class="text-gray-400 flex items-center gap-1">
              <i data-lucide="trending-down" class="w-3.5 h-3.5 text-red-500"></i> Keluar
            </span>
            <span class="font-bold text-red-500 tabular-nums">−${formatCurrencyShort(stats.expense)}</span>
          </div>
        </div>

        <!-- Daftar Detail Transaksi Dompet Ini -->
        <div class="space-y-2 mt-3">
          <div class="flex items-center justify-between text-xs text-gray-400 font-medium px-1 mb-1">
            <span>Riwayat Transaksi (${transactions.length})</span>
            ${transactions.length > 3 ? `
              <button onclick="switchWalletViewFilter('${wallet.id}')" class="text-green-600 dark:text-lime-400 hover:underline text-[11px] font-semibold">
                Lihat Semua (${transactions.length})
              </button>
            ` : ''}
          </div>

          ${transactions.length === 0 ? `
            <div class="py-5 text-center bg-gray-50/60 dark:bg-[#1A3B31]/40 rounded-xl border border-dashed border-gray-200 dark:border-[#1F4A3C]">
              <p class="text-xs text-gray-400">Belum ada transaksi di dompet ini</p>
              <button
                onclick="openAddModal('expense', '${wallet.id}')"
                class="mt-2 text-[11px] font-bold text-green-600 dark:text-lime-400 hover:underline inline-flex items-center gap-1">
                <i data-lucide="plus" class="w-3 h-3"></i> Catat transaksi pertama
              </button>
            </div>
          ` : `
            <div class="space-y-2">
              ${transactions.slice(0, 4).map(tx => renderWalletsTransactionItem(tx, wallet.id)).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Render detail satu dompet yang sedang difokuskan
 */
function renderSingleWalletDetailedSection(walletId) {
  const wallet = Store.getWallet(walletId);
  if (!wallet) {
    return `
      <div class="py-12 text-center">
        <p class="text-sm font-bold text-gray-500">Dompet tidak ditemukan</p>
        <button onclick="switchWalletViewFilter('all')" class="mt-2 text-xs text-green-600 font-semibold hover:underline">
          Kembali ke semua dompet
        </button>
      </div>
    `;
  }

  const color = wallet.color || '#14532D';
  const stats = Store.getWalletStats(walletId);
  const transactions = Store.getWalletTransactions(walletId, activeWalletTypeFilter);

  return `
    <div class="space-y-4">
      <!-- Hero Card Dompet Terpilih -->
      <div class="relative overflow-hidden rounded-[26px] p-5 text-white shadow-xl"
           style="background: linear-gradient(135deg, ${color}, ${color}EE); box-shadow: 0 10px 24px -4px ${color}66">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/25 flex items-center justify-center shadow-inner">
              <i data-lucide="${wallet.icon || 'wallet'}" class="w-5 h-5 text-white"></i>
            </div>
            <div>
              <span class="text-[11px] uppercase tracking-wider font-semibold text-white/80">Dompet Terpilih</span>
              <h2 class="text-base font-bold leading-tight text-white">${escapeHtml(wallet.name)}</h2>
            </div>
          </div>
          <button
            onclick="switchWalletViewFilter('all')"
            class="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/25 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 transition-all">
            <i data-lucide="x" class="w-3 h-3"></i> Tutup Fokus
          </button>
        </div>

        <div class="my-2.5">
          <p class="text-[11px] text-white/70 font-medium uppercase tracking-wider">Saldo Dompet</p>
          <p class="text-3xl font-extrabold tracking-tight tabular-nums text-white">
            ${formatCurrency(wallet.balance)}
          </p>
        </div>

        <!-- Metrics Row -->
        <div class="grid grid-cols-3 gap-2 pt-3 border-t border-white/20 mt-3 text-center">
          <div class="bg-black/20 backdrop-blur-sm rounded-xl p-2">
            <span class="text-[10px] text-white/75 block">Total Masuk</span>
            <span class="text-xs font-bold text-lime-300 tabular-nums">+${formatCurrencyShort(stats.income)}</span>
          </div>
          <div class="bg-black/20 backdrop-blur-sm rounded-xl p-2">
            <span class="text-[10px] text-white/75 block">Total Keluar</span>
            <span class="text-xs font-bold text-red-300 tabular-nums">−${formatCurrencyShort(stats.expense)}</span>
          </div>
          <div class="bg-black/20 backdrop-blur-sm rounded-xl p-2">
            <span class="text-[10px] text-white/75 block">Transaksi</span>
            <span class="text-xs font-bold text-white tabular-nums">${stats.txCount} tx</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="grid grid-cols-2 gap-2">
        <button
          onclick="openAddModal('expense', '${wallet.id}')"
          class="btn-compact py-2.5 px-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all">
          <i data-lucide="plus-circle" class="w-4 h-4"></i>
          <span>Catat Transaksi</span>
        </button>
        <button
          onclick="openAddModal('transfer', '${wallet.id}')"
          class="btn-compact py-2.5 px-3 rounded-xl bg-white dark:bg-[#132A23] border border-gray-200 dark:border-[#1F4A3C] text-gray-800 dark:text-green-100 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all">
          <i data-lucide="arrow-left-right" class="w-4 h-4 text-blue-500"></i>
          <span>Transfer Saldo</span>
        </button>
      </div>

      <!-- Filter Tipe Transaksi Tab Switcher -->
      <div class="bg-gray-200/80 dark:bg-[#132A23] p-1 rounded-2xl flex items-center gap-1 border border-gray-200/50 dark:border-[#1F4A3C]">
        <button
          onclick="switchWalletViewTypeFilter('all')"
          class="tab-btn flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${activeWalletTypeFilter === 'all' ? 'bg-white dark:bg-green-800 text-green-950 dark:text-white shadow-xs font-bold' : 'text-gray-500 dark:text-green-300/60'}">
          Semua
        </button>
        <button
          onclick="switchWalletViewTypeFilter('expense')"
          class="tab-btn flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${activeWalletTypeFilter === 'expense' ? 'bg-red-500 text-white shadow-xs font-bold' : 'text-gray-500 dark:text-green-300/60'}">
          Keluar
        </button>
        <button
          onclick="switchWalletViewTypeFilter('income')"
          class="tab-btn flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${activeWalletTypeFilter === 'income' ? 'bg-green-600 text-white shadow-xs font-bold' : 'text-gray-500 dark:text-green-300/60'}">
          Masuk
        </button>
        <button
          onclick="switchWalletViewTypeFilter('transfer')"
          class="tab-btn flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${activeWalletTypeFilter === 'transfer' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-gray-500 dark:text-green-300/60'}">
          Transfer
        </button>
      </div>

      <!-- Daftar Detail Transaksi Lengkap -->
      <div class="space-y-3">
        <div class="flex items-center justify-between text-xs px-1 text-gray-500 dark:text-green-300/70">
          <span class="font-semibold">Daftar Transaksi ${escapeHtml(wallet.name)}</span>
          <span class="bg-gray-100 dark:bg-[#1A3B31] px-2 py-0.5 rounded-md font-bold text-[11px]">${transactions.length} item</span>
        </div>

        ${transactions.length === 0 ? `
          <div class="py-12 px-4 text-center bg-white dark:bg-[#132A23] rounded-2xl border border-dashed border-gray-200 dark:border-[#1F4A3C]">
            <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1A3B31] flex items-center justify-center mx-auto mb-2 text-gray-400">
              <i data-lucide="receipt" class="w-5 h-5"></i>
            </div>
            <p class="text-xs font-bold text-gray-700 dark:text-green-100">Tidak ada transaksi pada filter ini</p>
          </div>
        ` : renderGroupedWalletTransactions(transactions, wallet.id)}
      </div>
    </div>
  `;
}

/**
 * Kelompokkan transaksi per tanggal untuk tampilan fokus
 */
function renderGroupedWalletTransactions(transactions, walletId) {
  const grouped = {};
  transactions.forEach(tx => {
    const d = tx.date || (tx.createdAt ? tx.createdAt.slice(0, 10) : 'Lainnya');
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(tx);
  });

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  return `
    <div class="space-y-3.5">
      ${sortedDates.map(dateKey => `
        <div>
          <div class="flex items-center justify-between px-1 mb-1.5 text-xs">
            <span class="font-bold text-gray-700 dark:text-green-200">
              ${formatDateGroupHeader(dateKey)} · <span class="text-gray-400 font-normal">${formatDate(dateKey)}</span>
            </span>
            <span class="text-[10px] text-gray-400">${grouped[dateKey].length} item</span>
          </div>
          <div class="space-y-2">
            ${grouped[dateKey].map(tx => renderWalletsTransactionItem(tx, walletId)).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Render single item baris transaksi dengan navigasi ke detail transaksi
 */
function renderWalletsTransactionItem(tx, currentWalletId) {
  const category = Store.getCategory(tx.categoryId);
  const fromWallet = Store.getWallet(tx.walletId);
  const toWallet = Store.getWallet(tx.toWalletId);

  let amountClass = 'text-gray-900 dark:text-white';
  let amountPrefix = '';
  let iconBgClass = 'bg-gray-100 dark:bg-gray-800';
  let iconColorClass = 'text-gray-600 dark:text-gray-300';
  let iconName = 'receipt';
  let subtitle = category?.name || 'Umum';

  if (tx.type === 'income') {
    amountClass = 'text-green-600 dark:text-green-400';
    amountPrefix = '+';
    iconBgClass = 'bg-green-100 dark:bg-green-950/50';
    iconColorClass = 'text-green-600 dark:text-green-400';
    iconName = category?.icon || 'trending-up';
    subtitle = category?.name || 'Pemasukan';
  } else if (tx.type === 'expense') {
    amountClass = 'text-red-600 dark:text-red-400';
    amountPrefix = '−';
    iconBgClass = getCategoryBgColor(category?.icon);
    iconColorClass = getCategoryIconColor(category?.icon);
    iconName = category?.icon || 'shopping-bag';
    subtitle = category?.name || 'Pengeluaran';
  } else if (tx.type === 'transfer') {
    iconName = 'arrow-left-right';
    iconBgClass = 'bg-blue-100 dark:bg-blue-950/50';
    iconColorClass = 'text-blue-600 dark:text-blue-400';

    if (tx.walletId === currentWalletId) {
      amountClass = 'text-red-500 dark:text-red-400';
      amountPrefix = '−';
      subtitle = `Transfer ke ${toWallet?.name || 'Dompet Lain'}`;
    } else {
      amountClass = 'text-green-600 dark:text-lime-400';
      amountPrefix = '+';
      subtitle = `Transfer dari ${fromWallet?.name || 'Dompet Lain'}`;
    }
  }

  const displayName = tx.itemName || tx.note || category?.name || (tx.type === 'transfer' ? 'Transfer Saldo' : 'Transaksi');
  const timeFormatted = tx.createdAt ? formatTime(tx.createdAt) : '';

  return `
    <div onclick="window.location.hash='#/transaction/${tx.id}'"
         class="flex items-center gap-3 p-3 bg-white dark:bg-[#1A3B31]/60 rounded-2xl shadow-xs border border-gray-100 dark:border-[#1F4A3C]/50 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md transition-all cursor-pointer group">
      <div class="w-10 h-10 rounded-xl ${iconBgClass} flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
        <i data-lucide="${iconName}" class="w-4 h-4 ${iconColorClass}"></i>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-xs sm:text-sm font-bold text-gray-900 dark:text-green-50 truncate group-hover:text-green-600 dark:group-hover:text-lime-300 transition-colors">${escapeHtml(displayName)}</p>
        <p class="text-[11px] text-gray-400 dark:text-green-300/60 truncate">${timeFormatted ? timeFormatted + ' · ' : ''}${subtitle}</p>
      </div>
      <div class="text-right flex-shrink-0 flex items-center gap-1.5">
        <p class="text-xs sm:text-sm font-bold ${amountClass} tabular-nums">
          ${amountPrefix}${formatCurrency(tx.amount)}
        </p>
        <button
          type="button"
          onclick="event.stopPropagation(); openEditTxModal('${tx.id}')"
          aria-label="Edit Transaksi"
          title="Edit Transaksi"
          class="btn-compact w-7 h-7 rounded-lg bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-lime-400 hover:bg-green-600 hover:text-white border border-green-200/70 dark:border-green-800/50 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95">
          <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
        </button>
        <i data-lucide="chevron-right" class="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all"></i>
      </div>
    </div>
  `;
}
