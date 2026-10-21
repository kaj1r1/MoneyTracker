// ========================================
// transactionDetail.js — Halaman Detail Transaksi
// ========================================

/**
 * Render Halaman Detail Transaksi berdasarkan ID
 * @param {string} txId - ID transaksi
 */
function renderTransactionDetail(txId) {
  const content = document.getElementById('app-content');
  if (!content) return;

  const tx = Store.getTransaction(txId);

  // Jika transaksi tidak ditemukan
  if (!tx) {
    content.innerHTML = renderTransactionNotFound();
    lucide.createIcons();
    return;
  }

  const category = Store.getCategory(tx.categoryId);
  const wallet = Store.getWallet(tx.walletId);
  const toWallet = tx.toWalletId ? Store.getWallet(tx.toWalletId) : null;

  // Metadata styling sesuai tipe
  let typeLabel = 'Pengeluaran';
  let typeColorClass = 'text-red-600 dark:text-red-400';
  let typeBgBadge = 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-900';
  let amountSign = '−';
  let iconName = category?.icon || 'shopping-bag';
  let iconBg = getCategoryBgColor(iconName);
  let iconColor = getCategoryIconColor(iconName);

  if (tx.type === 'income') {
    typeLabel = 'Pemasukan';
    typeColorClass = 'text-green-600 dark:text-lime-400';
    typeBgBadge = 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 border-green-200 dark:border-green-800';
    amountSign = '+';
    iconName = category?.icon || 'trending-up';
    iconBg = 'bg-green-100 dark:bg-green-950/50';
    iconColor = 'text-green-600 dark:text-green-400';
  } else if (tx.type === 'transfer') {
    typeLabel = 'Transfer Saldo';
    typeColorClass = 'text-blue-600 dark:text-blue-400';
    typeBgBadge = 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    amountSign = '';
    iconName = 'arrow-left-right';
    iconBg = 'bg-blue-100 dark:bg-blue-950/50';
    iconColor = 'text-blue-600 dark:text-blue-400';
  }

  const displayName = tx.itemName || tx.note || category?.name || (tx.type === 'transfer' ? 'Transfer Saldo' : 'Transaksi');
  const txDate = tx.date ? formatDate(tx.date) : (tx.createdAt ? formatDate(tx.createdAt) : '-');
  const txTime = tx.createdAt ? formatTime(tx.createdAt) + ' WIB' : '';
  const shortId = tx.id ? tx.id.slice(0, 8).toUpperCase() : '';

  content.innerHTML = `
    <!-- ======= 1. HEADER ======= -->
    <header class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2.5">
        <button
          onclick="handleBackFromDetail()"
          aria-label="Kembali"
          class="btn-compact w-10 h-10 rounded-full bg-white dark:bg-[#132A23] border border-gray-200 dark:border-[#1F4A3C] flex items-center justify-center text-gray-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors shadow-sm cursor-pointer">
          <i data-lucide="chevron-left" class="w-5 h-5"></i>
        </button>
        <div>
          <h1 class="text-xl font-bold text-gray-900 dark:text-green-50 leading-tight">Detail Transaksi</h1>
          <p class="text-xs text-gray-400 dark:text-green-300/60 font-medium">Informasi & bukti pencatatan</p>
        </div>
      </div>

      <!-- Action buttons: Share & Edit -->
      <div class="flex items-center gap-1.5">
        <button
          onclick="copyTransactionReceipt('${tx.id}')"
          title="Salin Rincian"
          class="btn-compact w-10 h-10 rounded-full bg-white dark:bg-[#132A23] border border-gray-200 dark:border-[#1F4A3C] flex items-center justify-center text-gray-600 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors shadow-sm cursor-pointer">
          <i data-lucide="share-2" class="w-4 h-4"></i>
        </button>
        <button
          onclick="openEditTxModal('${tx.id}')"
          title="Edit Transaksi"
          class="btn-compact w-10 h-10 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer">
          <i data-lucide="pencil" class="w-4 h-4"></i>
        </button>
      </div>
    </header>

    <!-- ======= 2. HERO STRUK TRANSAKSI (RECEIPT CARD) ======= -->
    <div class="bg-white dark:bg-[#132A23] rounded-[28px] p-6 shadow-md border border-gray-100 dark:border-[#1F4A3C] mb-5 text-center relative overflow-hidden">
      <!-- Top Decorative Notch / Background Glow -->
      <div class="absolute -top-12 -right-12 w-32 h-32 bg-green-400/10 rounded-full blur-2xl pointer-events-none"></div>
      <div class="absolute -bottom-12 -left-12 w-32 h-32 bg-lime-400/10 rounded-full blur-2xl pointer-events-none"></div>

      <!-- Icon Kategori Besar -->
      <div class="w-16 h-16 mx-auto rounded-3xl ${iconBg} flex items-center justify-center mb-3.5 shadow-sm border border-gray-100/50 dark:border-white/5">
        <i data-lucide="${iconName}" class="w-8 h-8 ${iconColor}"></i>
      </div>

      <!-- Badge Tipe Transaksi -->
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${typeBgBadge} mb-2 shadow-xs">
        <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
        <span>${typeLabel}</span>
      </div>

      <!-- Nama Transaksi -->
      <h2 class="text-xl font-extrabold text-gray-900 dark:text-green-50 tracking-tight mb-1">
        ${escapeHtml(displayName)}
      </h2>

      <!-- Nominal Transaksi Besar -->
      <div class="my-3">
        <p class="text-3xl sm:text-4xl font-extrabold tabular-nums tracking-tight ${typeColorClass}">
          ${amountSign}${formatCurrency(tx.amount)}
        </p>
      </div>

      <!-- Status Indicator -->
      <div class="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-lime-400 bg-green-50 dark:bg-green-950/60 px-3 py-1 rounded-full border border-green-200 dark:border-green-800/80">
        <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i>
        <span>Transaksi Tercatat Berhasil</span>
      </div>
    </div>

    <!-- ======= 3. TABEL INFORMASI DETAIL ======= -->
    <div class="bg-white dark:bg-[#132A23] rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-[#1F4A3C] mb-5 divide-y divide-gray-100 dark:divide-gray-800 text-xs sm:text-sm">

      <!-- ID Transaksi -->
      <div class="flex items-center justify-between py-3">
        <span class="text-gray-400 dark:text-green-300/60 font-medium">ID Transaksi</span>
        <div class="flex items-center gap-1.5 font-mono font-bold text-gray-700 dark:text-green-100">
          <span>#TX-${shortId}</span>
          <button
            onclick="copyToClipboard('${tx.id}', 'ID Transaksi disalin!')"
            class="btn-compact text-gray-400 hover:text-green-600 p-1"
            title="Salin ID">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>

      <!-- Tanggal & Waktu -->
      <div class="flex items-center justify-between py-3">
        <span class="text-gray-400 dark:text-green-300/60 font-medium">Tanggal & Waktu</span>
        <div class="text-right">
          <p class="font-bold text-gray-800 dark:text-green-50">${txDate}</p>
          ${txTime ? `<p class="text-[11px] text-gray-400 font-medium">${txTime}</p>` : ''}
        </div>
      </div>

      <!-- Kategori -->
      <div class="flex items-center justify-between py-3">
        <span class="text-gray-400 dark:text-green-300/60 font-medium">Kategori</span>
        <div class="flex items-center gap-1.5 font-bold text-gray-800 dark:text-green-50">
          <div class="w-6 h-6 rounded-lg ${iconBg} flex items-center justify-center">
            <i data-lucide="${iconName}" class="w-3.5 h-3.5 ${iconColor}"></i>
          </div>
          <span>${category ? escapeHtml(category.name) : 'Tanpa Kategori'}</span>
        </div>
      </div>

      <!-- Dompet / Metode -->
      <div class="flex items-center justify-between py-3">
        <span class="text-gray-400 dark:text-green-300/60 font-medium">
          ${tx.type === 'transfer' ? 'Alur Transfer' : 'Sumber Dompet'}
        </span>
        <div class="text-right font-bold text-gray-800 dark:text-green-50">
          ${tx.type === 'transfer' ? `
            <div class="flex items-center gap-1.5 font-semibold">
              <span class="text-gray-700 dark:text-green-200">${wallet ? wallet.name : '?'}</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5 text-blue-500"></i>
              <span class="text-blue-600 dark:text-blue-400 font-bold">${toWallet ? toWallet.name : '?'}</span>
            </div>
          ` : `
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${wallet?.color || '#22C55E'}"></span>
              <span>${wallet ? wallet.name : 'Wallet'}</span>
              <span class="text-[11px] text-gray-400 font-normal">(${wallet ? formatCurrencyShort(wallet.balance) : ''})</span>
            </div>
          `}
        </div>
      </div>

      <!-- Catatan -->
      <div class="py-3">
        <span class="text-gray-400 dark:text-green-300/60 font-medium block mb-1">Catatan Tambahan</span>
        <div class="p-3 rounded-2xl bg-gray-50 dark:bg-[#1A3B31]/70 border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-green-100 text-xs leading-relaxed">
          ${tx.note ? escapeHtml(tx.note) : '<span class="text-gray-400 italic">Tidak ada catatan untuk transaksi ini.</span>'}
        </div>
      </div>
    </div>

    <!-- ======= 4. TOMBOL AKSI (EDIT & HAPUS) ======= -->
    <div class="space-y-2.5 mb-6">
      <button
        onclick="openEditTxModal('${tx.id}')"
        class="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold text-sm py-3.5 px-4 rounded-2xl shadow-md shadow-green-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer">
        <i data-lucide="pencil" class="w-4 h-4"></i>
        <span>Ubah Data Transaksi</span>
      </button>

      <button
        onclick="handleDeleteFromDetail('${tx.id}', '${escapeHtml(displayName)}')"
        class="w-full bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 font-bold text-sm py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
        <span>Hapus Transaksi Ini</span>
      </button>
    </div>
  `;

  // Re-init ikon Lucide
  lucide.createIcons();
}

/**
 * Fallback jika ID transaksi tidak valid
 */
function renderTransactionNotFound() {
  return `
    <header class="flex items-center gap-2.5 mb-6">
      <a href="#/transactions"
         class="btn-compact w-10 h-10 rounded-full bg-white dark:bg-[#132A23] border border-gray-200 dark:border-[#1F4A3C] flex items-center justify-center text-gray-700 dark:text-green-300">
        <i data-lucide="chevron-left" class="w-5 h-5"></i>
      </a>
      <h1 class="text-xl font-bold text-gray-900 dark:text-green-50">Detail Transaksi</h1>
    </header>

    <div class="flex flex-col items-center justify-center py-16 px-6 text-center bg-white dark:bg-[#132A23] rounded-3xl shadow-sm border border-gray-100 dark:border-[#1F4A3C]">
      <div class="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center mb-3">
        <i data-lucide="file-question" class="w-8 h-8 text-red-500"></i>
      </div>
      <h2 class="text-lg font-bold text-gray-900 dark:text-green-50 mb-1">Transaksi Tidak Ditemukan</h2>
      <p class="text-xs text-gray-400 dark:text-green-300/60 max-w-xs mb-5">
        Data transaksi ini mungkin telah dihapus atau tautan tidak valid.
      </p>
      <a href="#/transactions"
         class="btn-compact text-xs font-semibold bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm flex items-center gap-1.5">
        <i data-lucide="arrow-left" class="w-4 h-4"></i>
        <span>Kembali ke Semua Transaksi</span>
      </a>
    </div>
  `;
}

// ========================================
// Modal Edit Handlers
// ========================================

let currentEditingTxId = null;

/**
 * Buka modal edit transaksi dengan input terisi
 */
function openEditTxModal(txId) {
  const tx = Store.getTransaction(txId);
  if (!tx) return;

  currentEditingTxId = txId;

  const overlay = document.getElementById('editTxModalOverlay');
  const drawer = document.getElementById('editTxModalDrawer');
  const fieldsContainer = document.getElementById('editTxFormFields');
  if (!overlay || !drawer || !fieldsContainer) return;

  const wallets = Store.getWallets();
  const isTransfer = tx.type === 'transfer';

  if (isTransfer) {
    // Mode Edit Transfer
    fieldsContainer.innerHTML = `
      <!-- Transfer Header Indicator -->
      <div class="flex items-center justify-between p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-lg bg-blue-500 text-white flex items-center justify-center">
            <i data-lucide="arrow-left-right" class="w-3.5 h-3.5"></i>
          </div>
          <span class="text-xs font-bold text-blue-700 dark:text-blue-300">Transfer Saldo Antar Dompet</span>
        </div>
        <input type="hidden" id="edit-type-input" value="transfer" />
      </div>

      <!-- Baris 1: Nominal & Keterangan (2 Kolom) -->
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-[11px] font-semibold text-gray-600 dark:text-green-300/70 mb-1">Nominal (Rp)</label>
          <div class="relative">
            <span class="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-xs text-gray-400">Rp</span>
            <input
              type="number"
              id="edit-amount-input"
              required
              min="1"
              value="${tx.amount}"
              class="w-full h-9 pl-8 pr-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A3B31] text-gray-900 dark:text-green-50 text-xs font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>
        </div>
        <div>
          <label class="block text-[11px] font-semibold text-gray-600 dark:text-green-300/70 mb-1">Keterangan / Nama</label>
          <input
            type="text"
            id="edit-name-input"
            value="${escapeHtml(tx.itemName || tx.note || 'Transfer Saldo')}"
            placeholder="Transfer..."
            class="w-full h-9 px-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A3B31] text-gray-900 dark:text-green-50 text-xs focus:outline-none focus:ring-2 focus:ring-green-500/50"
          />
        </div>
      </div>

      <!-- Baris 2: Dari Dompet & Ke Dompet (2 Kolom) -->
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-[11px] font-semibold text-gray-600 dark:text-green-300/70 mb-1">Dari Dompet</label>
          <select
            id="edit-wallet-select"
            required
            class="w-full h-9 px-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A3B31] text-gray-900 dark:text-green-50 text-xs focus:outline-none focus:ring-2 focus:ring-green-500/50">
            ${wallets.map(w => `
              <option value="${w.id}" ${w.id === tx.walletId ? 'selected' : ''}>${escapeHtml(w.name)}</option>
            `).join('')}
          </select>
        </div>
        <div>
          <label class="block text-[11px] font-semibold text-gray-600 dark:text-green-300/70 mb-1">Ke Dompet</label>
          <select
            id="edit-to-wallet-select"
            required
            class="w-full h-9 px-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A3B31] text-gray-900 dark:text-green-50 text-xs focus:outline-none focus:ring-2 focus:ring-green-500/50">
            ${wallets.map(w => `
              <option value="${w.id}" ${w.id === tx.toWalletId ? 'selected' : ''}>${escapeHtml(w.name)}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- Baris 3: Tanggal & Catatan (2 Kolom) -->
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-[11px] font-semibold text-gray-600 dark:text-green-300/70 mb-1">Tanggal</label>
          <input
            type="date"
            id="edit-date-input"
            required
            value="${tx.date || (tx.createdAt ? tx.createdAt.slice(0, 10) : todayISO())}"
            class="w-full h-9 px-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A3B31] text-gray-900 dark:text-green-50 text-xs focus:outline-none focus:ring-2 focus:ring-green-500/50"
          />
        </div>
        <div>
          <label class="block text-[11px] font-semibold text-gray-600 dark:text-green-300/70 mb-1">Catatan</label>
          <input
            type="text"
            id="edit-note-input"
            value="${escapeHtml(tx.note || '')}"
            placeholder="Catatan..."
            class="w-full h-9 px-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A3B31] text-gray-900 dark:text-green-50 text-xs focus:outline-none focus:ring-2 focus:ring-green-500/50"
          />
        </div>
      </div>

      <!-- Submit Button: Langsung Terlihat di Layar -->
      <button
        type="submit"
        class="w-full mt-2 bg-green-600 hover:bg-green-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm py-2.5 sm:py-3 rounded-xl shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all">
        <i data-lucide="check" class="w-4 h-4"></i>
        <span>Simpan Perubahan</span>
      </button>
    `;
  } else {
    // Mode Edit Pemasukan / Pengeluaran
    const categories = Store.getCategoriesByType(tx.type);

    fieldsContainer.innerHTML = `
      <!-- Tipe Transaksi (Pengeluaran vs Pemasukan) -->
      <div>
        <div class="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-[#1A3B31] p-1 rounded-xl">
          <button
            type="button"
            onclick="setEditModalType('expense')"
            id="edit-type-expense"
            class="tab-btn py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${tx.type === 'expense' ? 'bg-red-500 text-white shadow-xs' : 'text-gray-500 dark:text-green-300/60'}">
            <i data-lucide="trending-down" class="w-3.5 h-3.5"></i> Pengeluaran
          </button>
          <button
            type="button"
            onclick="setEditModalType('income')"
            id="edit-type-income"
            class="tab-btn py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${tx.type === 'income' ? 'bg-green-600 text-white shadow-xs' : 'text-gray-500 dark:text-green-300/60'}">
            <i data-lucide="trending-up" class="w-3.5 h-3.5"></i> Pemasukan
          </button>
        </div>
        <input type="hidden" id="edit-type-input" value="${tx.type}" />
      </div>

      <!-- Baris 1: Nominal & Keterangan (2 Kolom) -->
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-[11px] font-semibold text-gray-600 dark:text-green-300/70 mb-1">Nominal (Rp)</label>
          <div class="relative">
            <span class="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-xs text-gray-400">Rp</span>
            <input
              type="number"
              id="edit-amount-input"
              required
              min="1"
              value="${tx.amount}"
              class="w-full h-9 pl-8 pr-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A3B31] text-gray-900 dark:text-green-50 text-xs font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-semibold text-gray-600 dark:text-green-300/70 mb-1">Keterangan / Nama</label>
          <input
            type="text"
            id="edit-name-input"
            required
            value="${escapeHtml(tx.itemName || tx.note || '')}"
            placeholder="Contoh: Makan siang"
            class="w-full h-9 px-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A3B31] text-gray-900 dark:text-green-50 text-xs focus:outline-none focus:ring-2 focus:ring-green-500/50"
          />
        </div>
      </div>

      <!-- Baris 2: Dompet & Kategori (2 Kolom) -->
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-[11px] font-semibold text-gray-600 dark:text-green-300/70 mb-1">Pilih Dompet</label>
          <select
            id="edit-wallet-select"
            required
            class="w-full h-9 px-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A3B31] text-gray-900 dark:text-green-50 text-xs focus:outline-none focus:ring-2 focus:ring-green-500/50">
            ${wallets.map(w => `
              <option value="${w.id}" ${w.id === tx.walletId ? 'selected' : ''}>${escapeHtml(w.name)}</option>
            `).join('')}
          </select>
        </div>

        <div>
          <label class="block text-[11px] font-semibold text-gray-600 dark:text-green-300/70 mb-1">Kategori</label>
          <select
            id="edit-category-select"
            required
            class="w-full h-9 px-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A3B31] text-gray-900 dark:text-green-50 text-xs focus:outline-none focus:ring-2 focus:ring-green-500/50">
            ${categories.map(c => `
              <option value="${c.id}" ${c.id === tx.categoryId ? 'selected' : ''}>${escapeHtml(c.name)}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- Baris 3: Tanggal & Catatan (2 Kolom) -->
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-[11px] font-semibold text-gray-600 dark:text-green-300/70 mb-1">Tanggal</label>
          <input
            type="date"
            id="edit-date-input"
            required
            value="${tx.date || (tx.createdAt ? tx.createdAt.slice(0, 10) : todayISO())}"
            class="w-full h-9 px-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A3B31] text-gray-900 dark:text-green-50 text-xs focus:outline-none focus:ring-2 focus:ring-green-500/50"
          />
        </div>

        <div>
          <label class="block text-[11px] font-semibold text-gray-600 dark:text-green-300/70 mb-1">Catatan Tambahan</label>
          <input
            type="text"
            id="edit-note-input"
            value="${escapeHtml(tx.note || '')}"
            placeholder="Catatan..."
            class="w-full h-9 px-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A3B31] text-gray-900 dark:text-green-50 text-xs focus:outline-none focus:ring-2 focus:ring-green-500/50"
          />
        </div>
      </div>

      <!-- Submit Button: Langsung Terlihat di Layar -->
      <button
        type="submit"
        class="w-full mt-2 bg-green-600 hover:bg-green-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm py-2.5 sm:py-3 rounded-xl shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all">
        <i data-lucide="check" class="w-4 h-4"></i>
        <span>Simpan Perubahan</span>
      </button>
    `;
  }

  overlay.classList.remove('hidden');
  setTimeout(() => {
    overlay.classList.remove('opacity-0');
    drawer.classList.remove('-translate-y-6', 'opacity-0');
    drawer.classList.add('translate-y-0', 'opacity-100');
  }, 10);

  lucide.createIcons();
}

/**
 * Tutup modal edit
 */
function closeEditTxModal() {
  const overlay = document.getElementById('editTxModalOverlay');
  const drawer = document.getElementById('editTxModalDrawer');
  if (!overlay || !drawer) return;

  drawer.classList.remove('translate-y-0', 'opacity-100');
  drawer.classList.add('-translate-y-6', 'opacity-0');
  overlay.classList.add('opacity-0');
  setTimeout(() => overlay.classList.add('hidden'), 200);
}

/**
 * Handler form submit modal edit
 */
function handleEditTxSubmitForm(e) {
  e.preventDefault();
  if (currentEditingTxId) {
    handleEditTxSubmit(e, currentEditingTxId);
  }
}

/**
 * Set tipe pada modal edit
 */
function setEditModalType(type) {
  document.getElementById('edit-type-input').value = type;
  const expBtn = document.getElementById('edit-type-expense');
  const incBtn = document.getElementById('edit-type-income');

  if (type === 'expense') {
    expBtn.className = 'tab-btn py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-red-500 text-white shadow-xs';
    incBtn.className = 'tab-btn py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 text-gray-500 dark:text-green-300/60';
  } else {
    incBtn.className = 'tab-btn py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-green-600 text-white shadow-xs';
    expBtn.className = 'tab-btn py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 text-gray-500 dark:text-green-300/60';
  }

  // Update categories dropdown sesuai tipe
  const categories = Store.getCategoriesByType(type);
  const catSelect = document.getElementById('edit-category-select');
  if (catSelect) {
    catSelect.innerHTML = categories.map(c => `
      <option value="${c.id}">${escapeHtml(c.name)}</option>
    `).join('');
  }

  lucide.createIcons();
}

/**
 * Simpan hasil edit transaksi
 */
function handleEditTxSubmit(e, txId) {
  if (e && e.preventDefault) e.preventDefault();

  const type = document.getElementById('edit-type-input').value;
  const amount = parseFloat(document.getElementById('edit-amount-input').value);
  const itemName = document.getElementById('edit-name-input').value.trim();
  const walletId = document.getElementById('edit-wallet-select').value;
  const toWalletSelect = document.getElementById('edit-to-wallet-select');
  const toWalletId = toWalletSelect ? toWalletSelect.value : null;
  const categorySelect = document.getElementById('edit-category-select');
  const categoryId = categorySelect ? categorySelect.value : null;
  const date = document.getElementById('edit-date-input').value;
  const note = document.getElementById('edit-note-input').value.trim();

  if (!amount || amount <= 0 || !walletId) return;

  const updateData = {
    type,
    amount,
    itemName,
    walletId,
    date,
    note
  };

  if (type === 'transfer') {
    if (toWalletId) updateData.toWalletId = toWalletId;
  } else {
    if (categoryId) updateData.categoryId = categoryId;
  }

  // Lakukan update via Store (akan otomatis merevert & rekalkulasi saldo)
  Store.updateTransaction(txId, updateData);

  closeEditTxModal();

  // Re-render view yang sedang aktif
  if (typeof App !== 'undefined' && App.currentView === 'wallets') {
    renderWallets();
  } else if (typeof App !== 'undefined' && App.currentView === 'transactions') {
    renderTransactions();
  } else if (typeof App !== 'undefined' && App.currentView === 'wallet-detail') {
    if (typeof currentWalletDetailId !== 'undefined' && currentWalletDetailId) {
      renderWalletDetail(currentWalletDetailId);
    } else {
      renderDashboard();
    }
  } else if (typeof App !== 'undefined' && App.currentView === 'transaction-detail') {
    renderTransactionDetail(txId);
  } else {
    renderDashboard();
  }

  // Tampilkan toast
  showDetailToast('Transaksi berhasil diperbarui dan saldo disesuaikan!');
}

/**
 * Hapus transaksi dari halaman detail
 */
function handleDeleteFromDetail(txId, displayName) {
  const ok = confirm(`Hapus transaksi "${displayName}"?\nSaldo dompet terkait akan disesuaikan kembali.`);
  if (!ok) return;

  Store.deleteTransaction(txId);

  // Arahkan kembali ke halaman Semua Transaksi
  window.location.hash = '#/transactions';

  setTimeout(() => {
    showDetailToast('Transaksi berhasil dihapus');
  }, 200);
}

/**
 * Tombol kembali cerdas
 */
function handleBackFromDetail() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.hash = '#/transactions';
  }
}

/**
 * Salin ringkasan struk transaksi ke clipboard
 */
function copyTransactionReceipt(txId) {
  const tx = Store.getTransaction(txId);
  if (!tx) return;

  const category = Store.getCategory(tx.categoryId);
  const wallet = Store.getWallet(tx.walletId);
  const displayName = tx.itemName || tx.note || category?.name || tx.type;

  const text = `[Struk Personal Wallet]\nNama: ${displayName}\nTipe: ${tx.type.toUpperCase()}\nJumlah: ${formatCurrency(tx.amount)}\nDompet: ${wallet?.name || '-'}\nTanggal: ${tx.date || tx.createdAt}\nKategori: ${category?.name || '-'}`;

  copyToClipboard(text, 'Struk transaksi disalin ke clipboard!');
}

/**
 * Helper copy text
 */
function copyToClipboard(text, successMsg) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showDetailToast(successMsg);
    }).catch(() => {
      showDetailToast('Gagal menyalin');
    });
  } else {
    showDetailToast('Fitur clipboard tidak didukung');
  }
}

/**
 * Toast notifikasi lokal
 */
function showDetailToast(msg) {
  const existing = document.getElementById('pw-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'pw-toast';
  toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg border border-green-700 animate-scale-pop flex items-center gap-2';
  toast.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-lime-400"></i> ${escapeHtml(msg)}`;
  document.body.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => toast.remove(), 2500);
}
