// ========================================
// settings.js — Halaman Pengaturan, Dompet & Kategori
// ========================================

// State tab pengaturan
let settingsActiveTab = 'wallets'; // 'wallets' | 'categories' | 'preferences' | 'security'
let categorySubTab = 'all';        // 'all' | 'expense' | 'income'

// Preset pilihan warna untuk wallet
const WALLET_COLOR_PRESETS = [
  { name: 'Dark Green', hex: '#14532D' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Sky Blue', hex: '#0284C7' },
  { name: 'Orange', hex: '#EA580C' },
  { name: 'Purple', hex: '#7C3AED' },
  { name: 'Rose', hex: '#E11D48' },
  { name: 'Amber', hex: '#D97706' },
  { name: 'Slate', hex: '#334155' }
];

// Preset pilihan ikon untuk wallet
const WALLET_ICON_PRESETS = [
  'landmark',
  'credit-card',
  'smartphone',
  'banknote',
  'coins',
  'piggy-bank',
  'briefcase',
  'shield-check'
];

// Preset pilihan ikon untuk kategori
const CATEGORY_ICON_PRESETS = [
  'utensils',
  'car',
  'shopping-bag',
  'film',
  'heart-pulse',
  'zap',
  'book-open',
  'shirt',
  'dumbbell',
  'plane',
  'paw-print',
  'wrench',
  'coffee',
  'tv',
  'music',
  'gift',
  'trending-up',
  'dollar-sign',
  'badge-percent',
  'home'
];

/**
 * Render Halaman Pengaturan Utama
 */
function renderSettings(tab = null) {
  const content = document.getElementById('app-content');
  if (!content) return;

  if (tab) settingsActiveTab = tab;

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
          <h1 class="text-xl font-bold text-gray-900 dark:text-green-50 leading-tight">Pengaturan</h1>
          <p class="text-xs text-gray-400 dark:text-green-300/60 font-medium">Kelola dompet, kategori & preferensi</p>
        </div>
      </div>
    </header>

    <!-- ======= 2. TAB NAVIGASI PENGATURAN ======= -->
    <div class="bg-gray-200/80 dark:bg-[#132A23] p-1 rounded-2xl flex items-center gap-1 border border-gray-200/60 dark:border-[#1F4A3C] mb-5">
      <button
        onclick="switchSettingsTab('wallets')"
        id="btn-tab-wallets"
        class="tab-btn flex-1 py-2 px-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 ${settingsActiveTab === 'wallets' ? 'bg-white dark:bg-green-800 text-green-950 dark:text-white shadow-sm' : 'text-gray-500 dark:text-green-300/60'}">
        <i data-lucide="wallet" class="w-3.5 h-3.5"></i>
        <span>Dompet</span>
      </button>

      <button
        onclick="switchSettingsTab('categories')"
        id="btn-tab-categories"
        class="tab-btn flex-1 py-2 px-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 ${settingsActiveTab === 'categories' ? 'bg-white dark:bg-green-800 text-green-950 dark:text-white shadow-sm' : 'text-gray-500 dark:text-green-300/60'}">
        <i data-lucide="tag" class="w-3.5 h-3.5"></i>
        <span>Kategori</span>
      </button>

      <button
        onclick="switchSettingsTab('preferences')"
        id="btn-tab-preferences"
        class="tab-btn flex-1 py-2 px-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 ${settingsActiveTab === 'preferences' ? 'bg-white dark:bg-green-800 text-green-950 dark:text-white shadow-sm' : 'text-gray-500 dark:text-green-300/60'}">
        <i data-lucide="sliders-horizontal" class="w-3.5 h-3.5"></i>
        <span>Preferensi</span>
      </button>

      <button
        onclick="switchSettingsTab('security')"
        id="btn-tab-security"
        class="tab-btn flex-1 py-2 px-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 ${settingsActiveTab === 'security' ? 'bg-white dark:bg-green-800 text-green-950 dark:text-white shadow-sm' : 'text-gray-500 dark:text-green-300/60'}">
        <i data-lucide="shield-check" class="w-3.5 h-3.5 text-lime-500"></i>
        <span>Keamanan</span>
      </button>
    </div>

    <!-- ======= 3. KONTEN TAB AKTIF ======= -->
    <div id="settings-tab-content">
      ${renderSettingsTabContent(settingsActiveTab)}
    </div>
  `;

  lucide.createIcons();
}

/**
 * Ganti tab pengaturan
 */
function switchSettingsTab(tab) {
  settingsActiveTab = tab;
  renderSettings();
}

/**
 * Render konten tab pengaturan
 */
function renderSettingsTabContent(tab) {
  if (tab === 'wallets') return renderWalletsTab();
  if (tab === 'categories') return renderCategoriesTab();
  if (tab === 'security') return renderSecurityTab();
  return renderPreferencesTab();
}

// ========================================
// TAB 1: KELOLA DOMPET (WALLETS)
// ========================================

function renderWalletsTab() {
  const wallets = Store.getWallets();
  const totalBalance = Store.getTotalBalance();

  return `
    <div class="space-y-4">
      <!-- Top Actions Bar -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-gray-800 dark:text-green-100">Daftar Dompet (${wallets.length})</h2>
          <p class="text-[11px] text-gray-400">Total: ${formatCurrency(totalBalance)}</p>
        </div>
        <button
          onclick="openAddWalletModal()"
          class="btn-compact bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          <span>Tambah Dompet</span>
        </button>
      </div>

      <!-- List of Wallets -->
      <div class="space-y-2.5">
        ${wallets.map(w => {
          const color = w.color || '#14532D';
          const stats = Store.getWalletStats(w.id);
          return `
            <div onclick="window.location.hash='#/wallet/${w.id}'"
                 class="flex items-center justify-between p-3.5 bg-white dark:bg-[#132A23] rounded-2xl border border-gray-100 dark:border-[#1F4A3C] shadow-sm hover:border-green-400 dark:hover:border-green-600 transition-all cursor-pointer group">
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <div class="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-white shadow-xs group-hover:scale-105 transition-transform"
                     style="background: linear-gradient(135deg, ${color}, ${color}DD)">
                  <i data-lucide="${w.icon || 'wallet'}" class="w-5 h-5"></i>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <h3 class="text-sm font-bold text-gray-900 dark:text-green-50 truncate group-hover:text-green-600 dark:group-hover:text-lime-300 transition-colors">${escapeHtml(w.name)}</h3>
                    <span class="text-[10px] font-semibold text-gray-500 dark:text-green-300/80 bg-gray-100 dark:bg-[#1A3B31] px-1.5 py-0.5 rounded-md">
                      ${stats.txCount} tx
                    </span>
                  </div>
                  <p class="text-xs font-extrabold text-green-700 dark:text-lime-300 tabular-nums">
                    ${formatCurrency(w.balance)}
                  </p>
                </div>
              </div>

              <!-- Action buttons: Edit & Hapus -->
              <div class="flex items-center gap-1.5 flex-shrink-0" onclick="event.stopPropagation()">
                <button
                  onclick="openEditWalletModal('${w.id}')"
                  title="Edit Dompet"
                  class="btn-compact w-8 h-8 rounded-xl bg-gray-100 dark:bg-[#1A3B31] text-gray-600 dark:text-green-200 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/50 flex items-center justify-center transition-colors cursor-pointer">
                  <i data-lucide="pencil" class="w-4 h-4"></i>
                </button>
                <button
                  onclick="confirmDeleteWallet('${w.id}', '${escapeHtml(w.name)}')"
                  title="Hapus Dompet"
                  class="btn-compact w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-500 hover:bg-red-500 hover:text-white border border-red-200/60 dark:border-red-900/40 flex items-center justify-center transition-colors cursor-pointer">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
                <div class="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 dark:text-gray-600 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all">
                  <i data-lucide="chevron-right" class="w-4 h-4"></i>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      ${wallets.length === 0 ? `
        <div class="py-12 text-center bg-white dark:bg-[#132A23] rounded-2xl border border-dashed border-gray-200 dark:border-[#1F4A3C]">
          <i data-lucide="wallet" class="w-10 h-10 text-gray-400 mx-auto mb-2"></i>
          <p class="text-sm font-bold text-gray-700 dark:text-green-100">Belum Ada Dompet</p>
          <p class="text-xs text-gray-400 mb-4">Tambahkan dompet pertamamu untuk mulai mencatat keuangan</p>
          <button onclick="openAddWalletModal()" class="btn-compact text-xs font-bold bg-green-600 text-white px-4 py-2 rounded-xl">
            Tambah Dompet Sekarang
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Modal Tambah Dompet
 */
function openAddWalletModal() {
  const overlay = document.getElementById('settingsModalOverlay');
  const drawer = document.getElementById('settingsModalDrawer');
  const title = document.getElementById('settingsModalTitle');
  const subtitle = document.getElementById('settingsModalSubtitle');
  const body = document.getElementById('settingsModalBody');
  if (!overlay || !drawer) return;

  title.textContent = 'Tambah Dompet Baru';
  if (subtitle) subtitle.textContent = 'Atur nama, warna, dan ikon dompet';

  body.innerHTML = `
    <form id="walletForm" onsubmit="handleSaveWallet(event)" class="space-y-3">
      <div>
        <label class="block text-xs font-semibold text-gray-600 dark:text-green-300/70 mb-1">Nama Dompet</label>
        <input
          type="text"
          id="walletNameInput"
          required
          maxlength="30"
          placeholder="Contoh: Mandiri, Blu, ShopeePay..."
          class="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A3B31] text-gray-900 dark:text-green-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
        />
      </div>

      <!-- Pilih Warna -->
      <div>
        <label class="block text-xs font-semibold text-gray-600 dark:text-green-300/70 mb-1">Pilih Warna</label>
        <div class="grid grid-cols-4 gap-2">
          ${WALLET_COLOR_PRESETS.map((c, i) => `
            <label class="flex flex-col items-center gap-1 cursor-pointer">
              <input type="radio" name="walletColor" value="${c.hex}" ${i === 0 ? 'checked' : ''} class="sr-only peer" />
              <div class="w-9 h-9 rounded-xl peer-checked:ring-3 peer-checked:ring-offset-2 peer-checked:ring-green-600 transition-all flex items-center justify-center text-white" style="background-color: ${c.hex}">
                <i data-lucide="check" class="w-3.5 h-3.5 opacity-0 peer-checked:opacity-100"></i>
              </div>
              <span class="text-[9px] text-gray-500 truncate w-full text-center">${c.name}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <!-- Pilih Ikon -->
      <div>
        <label class="block text-xs font-semibold text-gray-600 dark:text-green-300/70 mb-1">Pilih Ikon</label>
        <div class="grid grid-cols-4 gap-1.5">
          ${WALLET_ICON_PRESETS.map((icon, i) => `
            <label class="cursor-pointer">
              <input type="radio" name="walletIcon" value="${icon}" ${i === 0 ? 'checked' : ''} class="sr-only peer" />
              <div class="h-10 rounded-xl bg-gray-100 dark:bg-[#1A3B31] peer-checked:bg-green-600 peer-checked:text-white text-gray-700 dark:text-green-200 flex items-center justify-center transition-all">
                <i data-lucide="${icon}" class="w-4 h-4"></i>
              </div>
            </label>
          `).join('')}
        </div>
      </div>

      <!-- Saldo Awal (Opsional) -->
      <div>
        <label class="block text-xs font-semibold text-gray-600 dark:text-green-300/70 mb-1">Saldo Awal (Opsional)</label>
        <input
          type="number"
          id="walletInitialBalance"
          min="0"
          value="0"
          class="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A3B31] text-gray-900 dark:text-green-50 text-xs sm:text-sm font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-green-500/50"
        />
        <p class="text-[10px] text-gray-400 mt-0.5">Saldo awal akan otomatis dicatat sebagai transaksi pemasukan.</p>
      </div>

      <button
        type="submit"
        class="w-full mt-2 bg-green-600 hover:bg-green-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm py-3 rounded-xl shadow-lg shadow-green-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all">
        <i data-lucide="check" class="w-4 h-4"></i>
        <span>Simpan Dompet</span>
      </button>
    </form>
  `;

  openSettingsModalUI();
}

/**
 * Modal Edit Dompet
 */
function openEditWalletModal(walletId) {
  const wallet = Store.getWallet(walletId);
  if (!wallet) return;

  const overlay = document.getElementById('settingsModalOverlay');
  const drawer = document.getElementById('settingsModalDrawer');
  const title = document.getElementById('settingsModalTitle');
  const subtitle = document.getElementById('settingsModalSubtitle');
  const body = document.getElementById('settingsModalBody');
  if (!overlay || !drawer) return;

  title.textContent = 'Edit Dompet';
  if (subtitle) subtitle.textContent = 'Ubah nama, warna, atau ikon dompet';

  body.innerHTML = `
    <form id="walletForm" onsubmit="handleSaveWallet(event, '${wallet.id}')" class="space-y-3">
      <div>
        <label class="block text-xs font-semibold text-gray-600 dark:text-green-300/70 mb-1">Nama Dompet</label>
        <input
          type="text"
          id="walletNameInput"
          required
          maxlength="30"
          value="${escapeHtml(wallet.name)}"
          class="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A3B31] text-gray-900 dark:text-green-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
        />
      </div>

      <!-- Pilih Warna -->
      <div>
        <label class="block text-xs font-semibold text-gray-600 dark:text-green-300/70 mb-1">Pilih Warna</label>
        <div class="grid grid-cols-4 gap-2">
          ${WALLET_COLOR_PRESETS.map(c => `
            <label class="flex flex-col items-center gap-1 cursor-pointer">
              <input type="radio" name="walletColor" value="${c.hex}" ${wallet.color === c.hex ? 'checked' : ''} class="sr-only peer" />
              <div class="w-9 h-9 rounded-xl peer-checked:ring-3 peer-checked:ring-offset-2 peer-checked:ring-green-600 transition-all flex items-center justify-center text-white" style="background-color: ${c.hex}">
                <i data-lucide="check" class="w-3.5 h-3.5 opacity-0 peer-checked:opacity-100"></i>
              </div>
              <span class="text-[9px] text-gray-500 truncate w-full text-center">${c.name}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <!-- Pilih Ikon -->
      <div>
        <label class="block text-xs font-semibold text-gray-600 dark:text-green-300/70 mb-1">Pilih Ikon</label>
        <div class="grid grid-cols-4 gap-1.5">
          ${WALLET_ICON_PRESETS.map(icon => `
            <label class="cursor-pointer">
              <input type="radio" name="walletIcon" value="${icon}" ${wallet.icon === icon ? 'checked' : ''} class="sr-only peer" />
              <div class="h-10 rounded-xl bg-gray-100 dark:bg-[#1A3B31] peer-checked:bg-green-600 peer-checked:text-white text-gray-700 dark:text-green-200 flex items-center justify-center transition-all">
                <i data-lucide="${icon}" class="w-4 h-4"></i>
              </div>
            </label>
          `).join('')}
        </div>
      </div>

      <button
        type="submit"
        class="w-full mt-2 bg-green-600 hover:bg-green-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm py-3 rounded-xl shadow-lg shadow-green-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all">
        <i data-lucide="check" class="w-4 h-4"></i>
        <span>Perbarui Dompet</span>
      </button>

      <button
        type="button"
        onclick="confirmDeleteWallet('${wallet.id}', '${escapeHtml(wallet.name)}')"
        class="w-full text-xs font-semibold text-red-500 hover:text-red-600 py-1.5 transition-colors cursor-pointer flex items-center justify-center gap-1.5">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
        <span>Hapus Dompet</span>
      </button>
    </form>
  `;

  openSettingsModalUI();
}

/**
 * Handle simpan dompet (tambah atau edit)
 */
function handleSaveWallet(e, walletId = null) {
  e.preventDefault();

  const name = document.getElementById('walletNameInput').value.trim();
  const color = document.querySelector('input[name="walletColor"]:checked')?.value || '#14532D';
  const icon = document.querySelector('input[name="walletIcon"]:checked')?.value || 'wallet';

  if (!name) return;

  if (walletId) {
    // Mode Edit
    Store.updateWallet(walletId, { name, color, icon });
    showSettingsToast('Dompet berhasil diperbarui!');
  } else {
    // Mode Tambah
    const newWallet = Store.addWallet({ name, color, icon });
    const initialBalance = parseFloat(document.getElementById('walletInitialBalance')?.value || 0);

    // Jika ada saldo awal, catat sebagai transaksi pemasukan awal
    if (initialBalance > 0) {
      Store.addTransaction({
        type: 'income',
        walletId: newWallet.id,
        amount: initialBalance,
        itemName: `Saldo Awal ${name}`,
        note: 'Pencatatan saldo awal saat pembuatan dompet',
        date: todayISO(),
        createdAt: new Date().toISOString()
      });
    }

    showSettingsToast('Dompet baru berhasil ditambahkan!');
  }

  closeSettingsModal();
  renderSettings();
}

/**
 * Konfirmasi hapus dompet
 */
function confirmDeleteWallet(walletId, name) {
  const ok = confirm(`Hapus dompet "${name}"?\nSemua transaksi yang berkaitan dengan dompet ini juga akan terhapus.`);
  if (!ok) return;

  closeSettingsModal();
  Store.deleteWallet(walletId);
  if (window.location.hash.startsWith('#/wallet/')) {
    window.location.hash = '#/wallets';
  } else {
    renderSettings();
  }
  showSettingsToast(`Dompet "${name}" berhasil dihapus`);
}

// ========================================
// TAB 2: KELOLA KATEGORI (CATEGORIES)
// ========================================

function renderCategoriesTab() {
  const allCategories = Store.getCategories();
  let categories = allCategories;

  if (categorySubTab === 'expense') {
    categories = allCategories.filter(c => c.type === 'expense');
  } else if (categorySubTab === 'income') {
    categories = allCategories.filter(c => c.type === 'income');
  }

  return `
    <div class="space-y-4">
      <!-- Top Action Bar -->
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-bold text-gray-800 dark:text-green-100">Daftar Kategori (${categories.length})</h2>
        <button
          onclick="openAddCategoryModal()"
          class="btn-compact bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          <span>Tambah Kategori</span>
        </button>
      </div>

      <!-- Sub-filter tipe kategori -->
      <div class="flex items-center gap-1.5 bg-gray-100 dark:bg-[#1A3B31] p-1 rounded-xl">
        <button
          onclick="switchCategorySubTab('all')"
          class="tab-btn flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${categorySubTab === 'all' ? 'bg-white dark:bg-green-800 text-green-950 dark:text-white shadow-xs font-bold' : 'text-gray-500 dark:text-green-300/60'}">
          Semua
        </button>
        <button
          onclick="switchCategorySubTab('expense')"
          class="tab-btn flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${categorySubTab === 'expense' ? 'bg-red-500 text-white shadow-xs font-bold' : 'text-gray-500 dark:text-green-300/60'}">
          Pengeluaran
        </button>
        <button
          onclick="switchCategorySubTab('income')"
          class="tab-btn flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${categorySubTab === 'income' ? 'bg-green-600 text-white shadow-xs font-bold' : 'text-gray-500 dark:text-green-300/60'}">
          Pemasukan
        </button>
      </div>

      <!-- Categories List -->
      <div class="space-y-2">
        ${categories.map(cat => {
          const isIncome = cat.type === 'income';
          const badgeClass = isIncome ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
          const iconBg = isIncome ? 'bg-green-100 dark:bg-green-950/60' : getCategoryBgColor(cat.icon);
          const iconColor = isIncome ? 'text-green-600 dark:text-green-400' : getCategoryIconColor(cat.icon);

          return `
            <div class="flex items-center justify-between p-3 bg-white dark:bg-[#132A23] rounded-2xl border border-gray-100 dark:border-[#1F4A3C] shadow-xs hover:border-green-300 dark:hover:border-green-700 transition-all">
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <div class="w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0">
                  <i data-lucide="${cat.icon || 'tag'}" class="w-5 h-5 ${iconColor}"></i>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <span class="text-sm font-bold text-gray-900 dark:text-green-50 truncate">${escapeHtml(cat.name)}</span>
                    <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md ${badgeClass}">
                      ${isIncome ? 'Masuk' : 'Keluar'}
                    </span>
                  </div>
                  <span class="text-[10px] text-gray-400">
                    ${cat.isCustom ? 'Kategori Kustom' : 'Kategori Bawaan'}
                  </span>
                </div>
              </div>

              <!-- Action buttons: Edit & Hapus Kategori -->
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onclick="openEditCategoryModal('${cat.id}')"
                  title="Edit Kategori"
                  class="btn-compact w-8 h-8 rounded-xl bg-gray-100 dark:bg-[#1A3B31] text-gray-600 dark:text-green-200 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/50 flex items-center justify-center transition-colors cursor-pointer">
                  <i data-lucide="pencil" class="w-4 h-4"></i>
                </button>
                <button
                  onclick="confirmDeleteCategory('${cat.id}', '${escapeHtml(cat.name)}')"
                  title="Hapus Kategori"
                  class="btn-compact w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-500 hover:bg-red-500 hover:text-white border border-red-200/60 dark:border-red-900/40 flex items-center justify-center transition-colors cursor-pointer">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function switchCategorySubTab(subTab) {
  categorySubTab = subTab;
  renderSettings();
}

/**
 * Modal Tambah Kategori
 */
function openAddCategoryModal() {
  const overlay = document.getElementById('settingsModalOverlay');
  const drawer = document.getElementById('settingsModalDrawer');
  const title = document.getElementById('settingsModalTitle');
  const subtitle = document.getElementById('settingsModalSubtitle');
  const body = document.getElementById('settingsModalBody');
  if (!overlay || !drawer) return;

  title.textContent = 'Tambah Kategori Baru';
  if (subtitle) subtitle.textContent = 'Pilih ikon dan jenis kategori';

  body.innerHTML = `
    <form id="catForm" onsubmit="handleSaveCategory(event)" class="space-y-3">
      <div>
        <label class="block text-xs font-semibold text-gray-600 dark:text-green-300/70 mb-1">Nama Kategori</label>
        <input
          type="text"
          id="catNameInput"
          required
          maxlength="30"
          placeholder="Contoh: Kopi, Kursus, Belanja..."
          class="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A3B31] text-gray-900 dark:text-green-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
        />
      </div>

      <!-- Tipe Kategori -->
      <div>
        <label class="block text-xs font-semibold text-gray-600 dark:text-green-300/70 mb-1">Tipe Kategori</label>
        <div class="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-[#1A3B31] p-1 rounded-xl">
          <label class="cursor-pointer">
            <input type="radio" name="catType" value="expense" checked class="sr-only peer" />
            <div class="py-2 rounded-lg text-xs font-bold text-center text-gray-500 dark:text-green-300/60 peer-checked:bg-red-500 peer-checked:text-white transition-all flex items-center justify-center gap-1.5 shadow-xs">
              <i data-lucide="trending-down" class="w-3.5 h-3.5"></i> Pengeluaran
            </div>
          </label>
          <label class="cursor-pointer">
            <input type="radio" name="catType" value="income" class="sr-only peer" />
            <div class="py-2 rounded-lg text-xs font-bold text-center text-gray-500 dark:text-green-300/60 peer-checked:bg-green-600 peer-checked:text-white transition-all flex items-center justify-center gap-1.5 shadow-xs">
              <i data-lucide="trending-up" class="w-3.5 h-3.5"></i> Pemasukan
            </div>
          </label>
        </div>
      </div>

      <!-- Pilihan Ikon (Kompak 6 Kolom) -->
      <div>
        <label class="block text-xs font-semibold text-gray-600 dark:text-green-300/70 mb-1">Pilih Ikon</label>
        <div class="grid grid-cols-5 sm:grid-cols-6 gap-1.5 max-h-36 overflow-y-auto p-1 bg-gray-50/50 dark:bg-[#0A1F1B]/40 rounded-xl border border-gray-100 dark:border-gray-800">
          ${CATEGORY_ICON_PRESETS.map((icon, i) => `
            <label class="cursor-pointer">
              <input type="radio" name="catIcon" value="${icon}" ${i === 0 ? 'checked' : ''} class="sr-only peer" />
              <div class="h-10 rounded-xl bg-white dark:bg-[#1A3B31] border border-gray-100 dark:border-gray-700/60 peer-checked:bg-green-600 peer-checked:border-green-600 peer-checked:text-white text-gray-600 dark:text-green-200 flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-green-900/40">
                <i data-lucide="${icon}" class="w-4 h-4"></i>
              </div>
            </label>
          `).join('')}
        </div>
      </div>

      <button
        type="submit"
        class="w-full mt-2 bg-green-600 hover:bg-green-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm py-3 rounded-xl shadow-lg shadow-green-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all">
        <i data-lucide="check" class="w-4 h-4"></i>
        <span>Simpan Kategori</span>
      </button>
    </form>
  `;

  openSettingsModalUI();
}

/**
 * Modal Edit Kategori
 */
function openEditCategoryModal(catId) {
  const cat = Store.getCategory(catId);
  if (!cat) return;

  const overlay = document.getElementById('settingsModalOverlay');
  const drawer = document.getElementById('settingsModalDrawer');
  const title = document.getElementById('settingsModalTitle');
  const subtitle = document.getElementById('settingsModalSubtitle');
  const body = document.getElementById('settingsModalBody');
  if (!overlay || !drawer) return;

  title.textContent = 'Edit Kategori';
  if (subtitle) subtitle.textContent = 'Ubah nama, tipe, atau ikon kategori';

  body.innerHTML = `
    <form id="catForm" onsubmit="handleSaveCategory(event, '${cat.id}')" class="space-y-3">
      <div>
        <label class="block text-xs font-semibold text-gray-600 dark:text-green-300/70 mb-1">Nama Kategori</label>
        <input
          type="text"
          id="catNameInput"
          required
          maxlength="30"
          value="${escapeHtml(cat.name)}"
          class="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A3B31] text-gray-900 dark:text-green-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
        />
      </div>

      <!-- Tipe Kategori -->
      <div>
        <label class="block text-xs font-semibold text-gray-600 dark:text-green-300/70 mb-1">Tipe Kategori</label>
        <div class="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-[#1A3B31] p-1 rounded-xl">
          <label class="cursor-pointer">
            <input type="radio" name="catType" value="expense" ${cat.type === 'expense' ? 'checked' : ''} class="sr-only peer" />
            <div class="py-2 rounded-lg text-xs font-bold text-center text-gray-500 dark:text-green-300/60 peer-checked:bg-red-500 peer-checked:text-white transition-all flex items-center justify-center gap-1.5 shadow-xs">
              <i data-lucide="trending-down" class="w-3.5 h-3.5"></i> Pengeluaran
            </div>
          </label>
          <label class="cursor-pointer">
            <input type="radio" name="catType" value="income" ${cat.type === 'income' ? 'checked' : ''} class="sr-only peer" />
            <div class="py-2 rounded-lg text-xs font-bold text-center text-gray-500 dark:text-green-300/60 peer-checked:bg-green-600 peer-checked:text-white transition-all flex items-center justify-center gap-1.5 shadow-xs">
              <i data-lucide="trending-up" class="w-3.5 h-3.5"></i> Pemasukan
            </div>
          </label>
        </div>
      </div>

      <!-- Pilihan Ikon (Kompak 6 Kolom) -->
      <div>
        <label class="block text-xs font-semibold text-gray-600 dark:text-green-300/70 mb-1">Pilih Ikon</label>
        <div class="grid grid-cols-5 sm:grid-cols-6 gap-1.5 max-h-36 overflow-y-auto p-1 bg-gray-50/50 dark:bg-[#0A1F1B]/40 rounded-xl border border-gray-100 dark:border-gray-800">
          ${CATEGORY_ICON_PRESETS.map(icon => `
            <label class="cursor-pointer">
              <input type="radio" name="catIcon" value="${icon}" ${cat.icon === icon ? 'checked' : ''} class="sr-only peer" />
              <div class="h-10 rounded-xl bg-white dark:bg-[#1A3B31] border border-gray-100 dark:border-gray-700/60 peer-checked:bg-green-600 peer-checked:border-green-600 peer-checked:text-white text-gray-600 dark:text-green-200 flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-green-900/40">
                <i data-lucide="${icon}" class="w-4 h-4"></i>
              </div>
            </label>
          `).join('')}
        </div>
      </div>

      <button
        type="submit"
        class="w-full mt-2 bg-green-600 hover:bg-green-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm py-3 rounded-xl shadow-lg shadow-green-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all">
        <i data-lucide="check" class="w-4 h-4"></i>
        <span>Perbarui Kategori</span>
      </button>

      <button
        type="button"
        onclick="confirmDeleteCategory('${cat.id}', '${escapeHtml(cat.name)}')"
        class="w-full text-xs font-semibold text-red-500 hover:text-red-600 py-1.5 transition-colors cursor-pointer flex items-center justify-center gap-1.5">
        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        <span>Hapus Kategori Ini</span>
      </button>
    </form>
  `;

  openSettingsModalUI();
}

/**
 * Handle simpan kategori (tambah atau edit)
 */
function handleSaveCategory(e, catId = null) {
  e.preventDefault();

  const name = document.getElementById('catNameInput').value.trim();
  const type = document.querySelector('input[name="catType"]:checked')?.value || 'expense';
  const icon = document.querySelector('input[name="catIcon"]:checked')?.value || 'tag';

  if (!name) return;

  if (catId) {
    Store.updateCategory(catId, { name, type, icon });
    showSettingsToast('Kategori berhasil diperbarui!');
  } else {
    Store.addCategory({ name, type, icon });
    showSettingsToast('Kategori baru berhasil ditambahkan!');
  }

  closeSettingsModal();
  renderSettings();
}

/**
 * Konfirmasi hapus kategori
 */
function confirmDeleteCategory(catId, name) {
  const ok = confirm(`Hapus kategori "${name}"?`);
  if (!ok) return;

  let result = Store.deleteCategory(catId);
  if (!result.success) {
    const force = confirm(`Kategori "${name}" saat ini sedang digunakan oleh ${result.txCount} transaksi.\n\nApakah kamu tetap ingin menghapus kategori ini? Kategori pada transaksi terkait akan diubah menjadi "Umum / Tanpa Kategori".`);
    if (!force) return;
    result = Store.deleteCategory(catId, true);
  }

  closeSettingsModal();
  renderSettings();
  showSettingsToast(`Kategori "${name}" berhasil dihapus`);
}

// ========================================
// TAB 3: PREFERENSI & AKUN
// ========================================

function renderPreferencesTab() {
  const settings = Store.getSettings();

  return `
    <div class="space-y-4">
      <!-- Profil Pengguna Card -->
      <div class="p-4 bg-white dark:bg-[#132A23] rounded-2xl border border-gray-100 dark:border-[#1F4A3C] shadow-xs space-y-3">
        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Profil Pengguna</h3>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Nama Panggilan</label>
          <div class="flex gap-2">
            <input
              type="text"
              id="prefUserNameInput"
              value="${escapeHtml(settings.userName || 'Ridoy')}"
              class="flex-1 h-10 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A3B31] text-xs font-bold text-gray-900 dark:text-green-50 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
            <button
              onclick="saveUserNamePref()"
              class="btn-compact bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3.5 rounded-xl transition-all">
              Simpan
            </button>
          </div>
        </div>
      </div>

      <!-- Tampilan Mode Gelap -->
      <div class="flex items-center justify-between p-4 bg-white dark:bg-[#132A23] rounded-2xl border border-gray-100 dark:border-[#1F4A3C] shadow-xs">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#1A3B31] flex items-center justify-center text-gray-700 dark:text-lime-300">
            <i data-lucide="moon" class="w-5 h-5"></i>
          </div>
          <div>
            <p class="text-sm font-bold text-gray-900 dark:text-green-50">Tema Gelap (Dark Mode)</p>
            <p class="text-[11px] text-gray-400">Kurangi silau pada mata</p>
          </div>
        </div>
        <button
          onclick="toggleDarkMode(); renderSettings();"
          class="btn-compact text-xs font-bold px-3.5 py-2 rounded-xl bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-lime-300">
          Ubah Tema
        </button>
      </div>

      <!-- Keamanan & Autentikasi Shortcut Card -->
      <div onclick="switchSettingsTab('security')" class="p-4 bg-white dark:bg-[#132A23] rounded-2xl border border-gray-100 dark:border-[#1F4A3C] shadow-xs flex items-center justify-between cursor-pointer hover:border-green-300 dark:hover:border-green-600 transition-all group">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-lime-50 dark:bg-lime-950/40 text-lime-700 dark:text-lime-300 flex items-center justify-center">
            <i data-lucide="shield-check" class="w-5 h-5"></i>
          </div>
          <div>
            <p class="text-sm font-bold text-gray-900 dark:text-green-50 group-hover:text-green-600 dark:group-hover:text-lime-300 transition-colors">Keamanan & Autentikasi Login</p>
            <p class="text-[11px] text-gray-400">Atur password, username & login biometrik</p>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-[10px] font-bold text-green-700 dark:text-lime-400 bg-green-50 dark:bg-green-950/60 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800">Buka</span>
          <i data-lucide="chevron-right" class="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform"></i>
        </div>
      </div>

      <!-- Data Reset Actions -->
      <div class="p-4 bg-white dark:bg-[#132A23] rounded-2xl border border-gray-100 dark:border-[#1F4A3C] shadow-xs space-y-3">
        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Kelola Penyimpanan Data</h3>

        <div class="space-y-2">
          <button
            onclick="confirmResetAllData()"
            class="w-full text-left p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-center justify-between transition-colors">
            <div>
              <p class="text-xs font-bold">Reset Semua Data & Transaksi</p>
              <p class="text-[10px] text-red-500/80">Menghapus seluruh riwayat dan mengembalikan ke setelan awal</p>
            </div>
            <i data-lucide="alert-triangle" class="w-4 h-4 text-red-500"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

function saveUserNamePref() {
  const name = document.getElementById('prefUserNameInput')?.value.trim();
  if (!name) return;

  const settings = Store.getSettings();
  settings.userName = name;
  Store.saveSettings(settings);

  showSettingsToast(`Nama pengguna diubah menjadi "${name}"`);
}

function confirmResetAllData() {
  const answer = prompt('Ketik "RESET" untuk menghapus semua data transaksi & dompet:');
  if (answer !== 'RESET') return;

  Store.resetAll();
  App.seedDemoData();
  window.location.hash = '#/dashboard';
  setTimeout(() => {
    showSettingsToast('Seluruh data berhasil direset ke setelan awal');
  }, 200);
}

// ========================================
// TAB 4: KEAMANAN & PENGATURAN LOGIN
// ========================================

function renderSecurityTab() {
  const auth = Store.getAuth();
  const lastLoginFormatted = auth.lastLogin ? formatDate(auth.lastLogin) + ' ' + formatTime(auth.lastLogin) + ' WIB' : 'Sesi saat ini';

  return `
    <div class="space-y-4">

      <!-- 1. Hero Card Status Keamanan -->
      <div class="p-4 sm:p-5 rounded-[24px] bg-gradient-to-br from-green-950 via-green-900 to-green-800 text-white shadow-lg border border-green-800/40 relative overflow-hidden">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-2xl bg-lime-400/20 border border-lime-400/30 text-lime-400 flex items-center justify-center shadow-inner">
              <i data-lucide="shield-check" class="w-5 h-5"></i>
            </div>
            <div>
              <span class="text-[10px] uppercase font-semibold text-green-300/80 tracking-wider">Akun Terdaftar</span>
              <h3 class="text-base font-extrabold text-white leading-tight">@${escapeHtml(auth.username || 'admin')}</h3>
            </div>
          </div>
          <span class="text-[11px] font-bold ${auth.appLockEnabled ? 'bg-lime-400/20 text-lime-300 border-lime-400/40' : 'bg-amber-400/20 text-amber-300 border-amber-400/40'} border px-2.5 py-1 rounded-full">
            ${auth.appLockEnabled ? 'Kunci Aktif' : 'Kunci Nonaktif'}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-2.5 border-t border-green-800/60 text-xs">
          <div>
            <span class="text-[10px] text-green-300/70 block">Metode Login</span>
            <span class="font-bold text-white flex items-center gap-1 mt-0.5">
              <i data-lucide="key-round" class="w-3.5 h-3.5 text-lime-400"></i>
              Password ${auth.biometricEnabled ? '+ Biometrik' : ''}
            </span>
          </div>
          <div>
            <span class="text-[10px] text-green-300/70 block">Login Terakhir</span>
            <span class="font-bold text-white text-[11px] truncate block mt-0.5">${lastLoginFormatted}</span>
          </div>
        </div>
      </div>

      <!-- 2. Pengaturan Kunci Aplikasi (App Lock Switch) -->
      <div class="p-4 bg-white dark:bg-[#132A23] rounded-2xl border border-gray-100 dark:border-[#1F4A3C] shadow-xs flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-lime-400 flex items-center justify-center flex-shrink-0">
            <i data-lucide="lock" class="w-5 h-5"></i>
          </div>
          <div>
            <p class="text-sm font-bold text-gray-900 dark:text-green-50">Kunci Aplikasi (App Lock)</p>
            <p class="text-[11px] text-gray-400 dark:text-green-300/60">Wajibkan login setiap kali membuka aplikasi</p>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
          <input
            type="checkbox"
            ${auth.appLockEnabled ? 'checked' : ''}
            onchange="handleToggleAppLock(this.checked)"
            class="sr-only peer"
          />
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
        </label>
      </div>

      <!-- 3. Pengaturan Login Biometrik -->
      <div class="p-4 bg-white dark:bg-[#132A23] rounded-2xl border border-gray-100 dark:border-[#1F4A3C] shadow-xs space-y-3">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-lime-50 dark:bg-lime-950/40 text-lime-700 dark:text-lime-300 flex items-center justify-center flex-shrink-0">
              <i data-lucide="fingerprint" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="text-sm font-bold text-gray-900 dark:text-green-50">Login Biometrik</p>
              <p class="text-[11px] text-gray-400 dark:text-green-300/60">Masuk instan dengan sidik jari atau Face ID</p>
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              ${auth.biometricEnabled ? 'checked' : ''}
              onchange="handleToggleBiometric(this.checked)"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
          </label>
        </div>

        <!-- Tombol Uji Biometrik -->
        <div class="pt-2 border-t border-gray-100 dark:border-[#1F4A3C]/60 flex items-center justify-between">
          <span class="text-[11px] text-gray-400">Verifikasi sensor di perangkat Anda:</span>
          <button
            type="button"
            onclick="testBiometricSensor()"
            class="btn-compact text-xs font-bold text-green-700 dark:text-lime-300 bg-green-50 dark:bg-green-950/60 hover:bg-green-100 px-3 py-1.5 rounded-xl border border-green-200 dark:border-green-800/80 flex items-center gap-1.5 transition-colors cursor-pointer">
            <i data-lucide="scan" class="w-3.5 h-3.5"></i>
            <span>Uji Coba Sensor</span>
          </button>
        </div>
      </div>

      <!-- 4. Ubah Username & Password Form -->
      <div class="p-4 bg-white dark:bg-[#132A23] rounded-2xl border border-gray-100 dark:border-[#1F4A3C] shadow-xs space-y-3.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i data-lucide="key" class="w-4 h-4 text-green-600 dark:text-lime-400"></i>
            <h3 class="text-xs font-bold text-gray-800 dark:text-green-100 uppercase tracking-wider">Ubah Kredensial Akun</h3>
          </div>
          <span class="text-[10px] font-semibold text-gray-400">Saat ini: <strong>${escapeHtml(auth.username)}</strong></span>
        </div>

        <form onsubmit="handleSaveSecurityCredentials(event)" class="space-y-3">
          <!-- Password Saat Ini -->
          <div>
            <label class="block text-xs font-semibold text-gray-600 dark:text-green-300/70 mb-1">
              Password Saat Ini <span class="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="secCurrentPasswordInput"
              required
              placeholder="Masukkan password saat ini..."
              class="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A3B31] text-xs font-semibold text-gray-900 dark:text-green-50 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>

          <!-- Grid: Username Baru & Password Baru -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block text-xs font-semibold text-gray-600 dark:text-green-300/70 mb-1">
                Username Baru <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="secNewUsernameInput"
                required
                value="${escapeHtml(auth.username || 'admin')}"
                placeholder="Username baru..."
                class="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A3B31] text-xs font-semibold text-gray-900 dark:text-green-50 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-600 dark:text-green-300/70 mb-1">
                Password Baru <span class="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="secNewPasswordInput"
                required
                minlength="4"
                placeholder="Minimal 4 karakter..."
                class="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A3B31] text-xs font-semibold text-gray-900 dark:text-green-50 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn-compact w-full py-2.5 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-md shadow-green-600/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer">
            <i data-lucide="check" class="w-4 h-4"></i>
            <span>Simpan Perubahan Kredensial</span>
          </button>
        </form>
      </div>

      <!-- 5. Tombol Keluar & Kunci Aplikasi -->
      <div class="p-4 bg-white dark:bg-[#132A23] rounded-2xl border border-gray-100 dark:border-[#1F4A3C] shadow-xs space-y-2.5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-gray-900 dark:text-green-50">Sesi Login Aplikasi</p>
            <p class="text-[10px] text-gray-400">Kunci sesi sekarang dan kembali ke halaman login</p>
          </div>
        </div>
        <button
          type="button"
          onclick="confirmLogoutApp()"
          class="btn-compact w-full py-2.5 px-4 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-500 hover:text-white text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.99]">
          <i data-lucide="log-out" class="w-4 h-4"></i>
          <span>Kunci Aplikasi Sekarang (Logout)</span>
        </button>
      </div>

    </div>
  `;
}

function handleToggleAppLock(checked) {
  Store.setAppLockEnabled(checked);
  showSettingsToast(checked ? 'Kunci aplikasi diaktifkan: login diwajibkan saat buka aplikasi' : 'Kunci aplikasi dinonaktifkan: aplikasi terbuka langsung tanpa login');
  renderSettings();
}

function handleToggleBiometric(checked) {
  Store.setBiometricEnabled(checked);
  showSettingsToast(checked ? 'Login Biometrik diaktifkan' : 'Login Biometrik dinonaktifkan');
  renderSettings();
}

function testBiometricSensor() {
  openBiometricScannerModal({
    title: 'Pengujian Sensor Biometrik',
    subtitle: 'Tempelkan jari Anda untuk memverifikasi sensor perangkat',
    onSuccess: () => {
      showSettingsToast('Sensor biometrik berhasil diverifikasi dan siap digunakan!');
    }
  });
}

function handleSaveSecurityCredentials(e) {
  e.preventDefault();
  const currentPass = document.getElementById('secCurrentPasswordInput')?.value;
  const newUsername = document.getElementById('secNewUsernameInput')?.value.trim();
  const newPassword = document.getElementById('secNewPasswordInput')?.value;

  const res = Store.updateCredentials(currentPass, newUsername, newPassword);
  if (res.success) {
    showSettingsToast(`Username & Password berhasil diperbarui! (@${newUsername})`);
    renderSettings();
  } else {
    alert(res.message || 'Gagal memperbarui kredensial.');
  }
}

function confirmLogoutApp() {
  const ok = confirm('Kunci aplikasi sekarang?\nAnda akan diarahkan ke halaman login untuk masuk kembali.');
  if (!ok) return;

  App.lockApp();
}

// ========================================
// Modal UI Controls
// ========================================

function openSettingsModalUI() {
  const overlay = document.getElementById('settingsModalOverlay');
  const drawer = document.getElementById('settingsModalDrawer');
  if (!overlay || !drawer) return;

  overlay.classList.remove('hidden');
  setTimeout(() => {
    overlay.classList.remove('opacity-0');
    drawer.classList.remove('-translate-y-6', 'opacity-0');
    drawer.classList.add('translate-y-0', 'opacity-100');
  }, 10);

  lucide.createIcons();
}

function closeSettingsModal() {
  const overlay = document.getElementById('settingsModalOverlay');
  const drawer = document.getElementById('settingsModalDrawer');
  if (!overlay || !drawer) return;

  drawer.classList.remove('translate-y-0', 'opacity-100');
  drawer.classList.add('-translate-y-6', 'opacity-0');
  overlay.classList.add('opacity-0');
  setTimeout(() => overlay.classList.add('hidden'), 200);
}

function showSettingsToast(msg) {
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
