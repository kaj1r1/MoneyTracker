// ========================================
// walletDetail.js — Halaman Detail & Transaksi Dompet
// ========================================

let currentWalletDetailId = null;
let currentWalletTxTab = 'all'; // 'all' | 'expense' | 'income' | 'transfer'

/**
 * Render Halaman Detail Dompet & Transaksi Terkait
 */
function renderWalletDetail(walletId) {
  currentWalletDetailId = walletId;
  const content = document.getElementById('app-content');
  if (!content) return;

  const wallet = Store.getWallet(walletId);

  // Jika dompet tidak ditemukan
  if (!wallet) {
    content.innerHTML = `
      <div class="py-16 text-center">
        <div class="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 text-red-500 mx-auto flex items-center justify-center mb-3">
          <i data-lucide="alert-circle" class="w-8 h-8"></i>
        </div>
        <h2 class="text-lg font-bold text-gray-900 dark:text-green-50 mb-1">Dompet Tidak Ditemukan</h2>
        <p class="text-xs text-gray-400 mb-5">Dompet mungkin sudah dihapus atau ID tidak valid.</p>
        <a href="#/wallets" class="btn-compact inline-flex items-center gap-1.5 bg-green-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl">
          <i data-lucide="arrow-left" class="w-4 h-4"></i> Kembali ke Daftar Dompet
        </a>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  const color = wallet.color || '#14532D';
  const stats = Store.getWalletStats(walletId);
  const transactions = Store.getWalletTransactions(walletId, currentWalletTxTab);

  content.innerHTML = `
    <!-- ======= 1. HEADER ======= -->
    <header class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2.5">
        <a href="#/wallets"
           aria-label="Kembali ke Daftar Dompet"
           class="btn-compact w-10 h-10 rounded-full bg-white dark:bg-[#132A23] border border-gray-200 dark:border-[#1F4A3C] flex items-center justify-center text-gray-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors shadow-sm">
          <i data-lucide="chevron-left" class="w-5 h-5"></i>
        </a>
        <div>
          <h1 class="text-xl font-bold text-gray-900 dark:text-green-50 leading-tight">${escapeHtml(wallet.name)}</h1>
          <p class="text-xs text-gray-400 dark:text-green-300/60 font-medium">Mutasi & Riwayat Transaksi</p>
        </div>
      </div>

      <!-- Quick Action: Edit Dompet -->
      <button
        onclick="openEditWalletModalFromDetail('${wallet.id}')"
        title="Edit Dompet"
        class="btn-compact w-10 h-10 rounded-full bg-white dark:bg-[#132A23] border border-gray-200 dark:border-[#1F4A3C] flex items-center justify-center text-gray-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors shadow-sm cursor-pointer">
        <i data-lucide="pencil" class="w-4 h-4"></i>
      </button>
    </header>

    <!-- ======= 2. KARTU DOMPET UTAMA (HERO CARD) ======= -->
    <section class="mb-5">
      <div class="relative overflow-hidden rounded-[26px] p-5 sm:p-6 text-white shadow-xl transition-all"
           style="background: linear-gradient(135deg, ${color}, ${color}EE); box-shadow: 0 12px 28px -6px ${color}88">

        <!-- Top Wallet Info -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/25 flex items-center justify-center shadow-inner">
              <i data-lucide="${wallet.icon || 'wallet'}" class="w-5 h-5 text-white"></i>
            </div>
            <div>
              <span class="text-xs uppercase tracking-wider font-semibold text-white/80">Dompet Digital</span>
              <h2 class="text-base font-bold leading-tight text-white">${escapeHtml(wallet.name)}</h2>
            </div>
          </div>
          <span class="bg-white/20 backdrop-blur-sm border border-white/25 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
            <i data-lucide="activity" class="w-3 h-3"></i>
            ${stats.txCount} Transaksi
          </span>
        </div>

        <!-- Big Saldo Display -->
        <div class="my-3">
          <p class="text-[11px] text-white/70 font-medium uppercase tracking-wider">Saldo Saat Ini</p>
          <p class="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums text-white">
            ${formatCurrency(wallet.balance)}
          </p>
        </div>

        <!-- Mini Stats: Pemasukan vs Pengeluaran Dompet Ini -->
        <div class="grid grid-cols-2 gap-2.5 pt-3 border-t border-white/20 mt-3">
          <div class="bg-black/20 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
            <div class="flex items-center gap-1.5 mb-0.5">
              <i data-lucide="trending-up" class="w-3.5 h-3.5 text-lime-300"></i>
              <span class="text-[10px] text-white/80 font-medium">Total Masuk</span>
            </div>
            <p class="text-xs sm:text-sm font-bold text-lime-300 tabular-nums truncate">
              +${formatCurrency(stats.income)}
            </p>
          </div>

          <div class="bg-black/20 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
            <div class="flex items-center gap-1.5 mb-0.5">
              <i data-lucide="trending-down" class="w-3.5 h-3.5 text-red-300"></i>
              <span class="text-[10px] text-white/80 font-medium">Total Keluar</span>
            </div>
            <p class="text-xs sm:text-sm font-bold text-red-300 tabular-nums truncate">
              −${formatCurrency(stats.expense)}
            </p>
          </div>
        </div>

        <!-- Background Ambient Accents -->
        <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>
    </section>

    <!-- ======= 3. AKSI CEPAT DOMPET ======= -->
    <section class="flex items-center gap-2 mb-5">
      <button
        onclick="openAddModal('expense', '${wallet.id}')"
        class="btn-compact flex-1 py-3 px-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-md shadow-green-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer">
        <i data-lucide="plus-circle" class="w-4 h-4"></i>
        <span>Catat Transaksi</span>
      </button>

      <button
        onclick="openAddModal('transfer', '${wallet.id}')"
        class="btn-compact flex-1 py-3 px-3 rounded-2xl bg-white dark:bg-[#132A23] border border-gray-200 dark:border-[#1F4A3C] text-gray-800 dark:text-green-100 font-bold text-xs shadow-xs hover:bg-green-50 dark:hover:bg-green-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer">
        <i data-lucide="arrow-left-right" class="w-4 h-4 text-blue-500"></i>
        <span>Transfer Saldo</span>
      </button>
    </section>

    <!-- ======= 4. RIWAYAT TRANSAKSI DOMPET ======= -->
    <section class="mb-8" aria-labelledby="wallet-transactions-heading">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <h2 id="wallet-transactions-heading" class="text-sm font-bold text-gray-900 dark:text-green-50 flex items-center gap-1.5">
            <i data-lucide="history" class="w-4 h-4 text-green-600 dark:text-lime-400"></i>
            <span>Riwayat Transaksi</span>
          </h2>
          <span class="text-[11px] font-bold text-green-800 dark:text-lime-300 bg-green-100 dark:bg-green-950 px-2 py-0.5 rounded-full">
            ${transactions.length} Item
          </span>
        </div>

        <button
          onclick="openAllTxWithWalletFilter('${wallet.id}')"
          class="btn-compact text-xs font-semibold text-green-600 dark:text-lime-400 hover:underline flex items-center gap-1 cursor-pointer">
          Filter Lengkap <i data-lucide="sliders-horizontal" class="w-3 h-3"></i>
        </button>
      </div>

      <!-- TAB FILTER TIPE (Semua / Pengeluaran / Pemasukan / Transfer) -->
      <div class="bg-gray-200/80 dark:bg-[#132A23] p-1 rounded-2xl flex items-center gap-1 border border-gray-200/50 dark:border-[#1F4A3C] mb-3.5">
        <button
          onclick="switchWalletTxTab('all')"
          id="wtab-btn-all"
          class="tab-btn flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${currentWalletTxTab === 'all' ? 'bg-white dark:bg-green-800 text-green-950 dark:text-white shadow-xs font-bold' : 'text-gray-500 dark:text-green-300/60'}">
          <span>Semua</span>
        </button>
        <button
          onclick="switchWalletTxTab('expense')"
          id="wtab-btn-expense"
          class="tab-btn flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${currentWalletTxTab === 'expense' ? 'bg-red-500 text-white shadow-xs font-bold' : 'text-gray-500 dark:text-green-300/60'}">
          <span>Keluar</span>
        </button>
        <button
          onclick="switchWalletTxTab('income')"
          id="wtab-btn-income"
          class="tab-btn flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${currentWalletTxTab === 'income' ? 'bg-green-600 text-white shadow-xs font-bold' : 'text-gray-500 dark:text-green-300/60'}">
          <span>Masuk</span>
        </button>
        <button
          onclick="switchWalletTxTab('transfer')"
          id="wtab-btn-transfer"
          class="tab-btn flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${currentWalletTxTab === 'transfer' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-gray-500 dark:text-green-300/60'}">
          <span>Transfer</span>
        </button>
      </div>

      <!-- DAFTAR TRANSAKSI -->
      <div id="wallet-tx-list-container">
        ${renderWalletTransactionsList(transactions, wallet)}
      </div>
    </section>
  `;

  lucide.createIcons();
}

/**
 * Switch tab tipe transaksi di halaman detail dompet
 */
function switchWalletTxTab(tab) {
  currentWalletTxTab = tab;
  if (!currentWalletDetailId) return;

  const wallet = Store.getWallet(currentWalletDetailId);
  if (!wallet) return;

  const transactions = Store.getWalletTransactions(currentWalletDetailId, tab);

  // Update tabs style
  ['all', 'expense', 'income', 'transfer'].forEach(t => {
    const btn = document.getElementById(`wtab-btn-${t}`);
    if (!btn) return;
    if (t === tab) {
      if (t === 'expense') btn.className = 'tab-btn flex-1 py-1.5 px-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1 bg-red-500 text-white shadow-xs font-bold';
      else if (t === 'income') btn.className = 'tab-btn flex-1 py-1.5 px-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1 bg-green-600 text-white shadow-xs font-bold';
      else if (t === 'transfer') btn.className = 'tab-btn flex-1 py-1.5 px-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1 bg-blue-600 text-white shadow-xs font-bold';
      else btn.className = 'tab-btn flex-1 py-1.5 px-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1 bg-white dark:bg-green-800 text-green-950 dark:text-white shadow-xs font-bold';
    } else {
      btn.className = 'tab-btn flex-1 py-1.5 px-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1 text-gray-500 dark:text-green-300/60 font-medium';
    }
  });

  const container = document.getElementById('wallet-tx-list-container');
  if (container) {
    container.innerHTML = renderWalletTransactionsList(transactions, wallet);
    lucide.createIcons();
  }
}

/**
 * Render daftar transaksi untuk dompet
 */
function renderWalletTransactionsList(transactions, wallet) {
  if (!transactions || transactions.length === 0) {
    return `
      <div class="py-12 px-4 text-center bg-white dark:bg-[#132A23] rounded-2xl border border-dashed border-gray-200 dark:border-[#1F4A3C]">
        <div class="w-12 h-12 rounded-full bg-green-50 dark:bg-green-950/40 flex items-center justify-center mx-auto mb-2.5">
          <i data-lucide="receipt" class="w-6 h-6 text-green-600 dark:text-lime-400"></i>
        </div>
        <p class="text-sm font-bold text-gray-800 dark:text-green-100 mb-1">Belum Ada Transaksi</p>
        <p class="text-xs text-gray-400 dark:text-green-300/60 mb-4 max-w-[260px] mx-auto">
          Belum ada riwayat transaksi pada dompet <strong>${escapeHtml(wallet.name)}</strong>.
        </p>
        <button
          onclick="openAddModal('expense', '${wallet.id}')"
          class="btn-compact text-xs font-bold bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow-sm inline-flex items-center gap-1.5 transition-all">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          <span>Catat Transaksi Pertama</span>
        </button>
      </div>
    `;
  }

  // Kelompokkan per tanggal
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
        return `
          <div>
            <!-- Date Header -->
            <div class="flex items-center justify-between px-1 mb-2">
              <span class="text-xs font-bold text-gray-700 dark:text-green-200">
                ${formatDateGroupHeader(dateKey)} · <span class="text-gray-400 font-normal">${formatDate(dateKey)}</span>
              </span>
              <span class="text-[10px] font-semibold text-gray-400">
                ${txsOnDate.length} item
              </span>
            </div>

            <!-- Transaction Items -->
            <div class="space-y-2 stagger">
              ${txsOnDate.map(tx => renderWalletTransactionItem(tx, wallet.id)).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Render single item baris transaksi dompet
 */
function renderWalletTransactionItem(tx, currentWalletId) {
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
      // Transfer Keluar dari dompet ini
      amountClass = 'text-red-500 dark:text-red-400';
      amountPrefix = '−';
      subtitle = `Transfer ke ${toWallet?.name || 'Dompet Lain'}`;
    } else {
      // Transfer Masuk ke dompet ini
      amountClass = 'text-green-600 dark:text-lime-400';
      amountPrefix = '+';
      subtitle = `Transfer dari ${fromWallet?.name || 'Dompet Lain'}`;
    }
  }

  const displayName = tx.itemName || tx.note || category?.name || (tx.type === 'transfer' ? 'Transfer Saldo' : 'Transaksi');
  const timeFormatted = tx.createdAt ? formatTime(tx.createdAt) : '';

  return `
    <div onclick="window.location.hash='#/transaction/${tx.id}'"
         class="flex items-center gap-3 p-3 sm:p-3.5 bg-white dark:bg-[#132A23] rounded-2xl shadow-xs border border-gray-100 dark:border-[#1F4A3C]/60 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md transition-all cursor-pointer group">
      <div class="w-11 h-11 rounded-2xl ${iconBgClass} flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
        <i data-lucide="${iconName}" class="w-5 h-5 ${iconColorClass}"></i>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-bold text-gray-900 dark:text-green-50 truncate group-hover:text-green-600 dark:group-hover:text-lime-300 transition-colors">${escapeHtml(displayName)}</p>
        <p class="text-[11px] text-gray-400 dark:text-green-300/60 truncate">${timeFormatted ? timeFormatted + ' · ' : ''}${subtitle}</p>
      </div>
      <div class="text-right flex-shrink-0 flex items-center gap-1.5">
        <p class="text-sm sm:text-base font-bold ${amountClass} tabular-nums">
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
        <i data-lucide="chevron-right" class="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all"></i>
      </div>
    </div>
  `;
}

/**
 * Buka semua transaksi dengan filter wallet terpilih
 */
function openAllTxWithWalletFilter(walletId) {
  if (typeof txFilterState !== 'undefined') {
    txFilterState.walletId = walletId;
    txFilterState.type = 'all';
    txFilterState.datePreset = 'all';
  }
  window.location.hash = '#/transactions';
}

/**
 * Edit dompet langsung dari halaman detail dompet
 */
function openEditWalletModalFromDetail(walletId) {
  // Buka halaman pengaturan tab wallets & buka edit modal
  window.location.hash = '#/settings';
  setTimeout(() => {
    if (typeof openEditWalletModal === 'function') {
      openEditWalletModal(walletId);
    }
  }, 100);
}
