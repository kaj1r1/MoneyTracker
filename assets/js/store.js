// ========================================
// store.js — localStorage CRUD (Data Layer)
// ========================================

const KEYS = {
  wallets: 'pw_wallets',
  transactions: 'pw_transactions',
  categories: 'pw_categories',
  settings: 'pw_settings',
  auth: 'pw_auth',
};

const SESSION_AUTH_KEY = 'pw_session_logged_in';
const REMEMBER_AUTH_KEY = 'pw_remember_logged_in';

const DEFAULT_AUTH = {
  appLockEnabled: true,       // Mewajibkan login saat aplikasi dibuka
  username: 'admin',          // Username default
  password: 'password123',    // Password default
  biometricEnabled: true,     // Login via Biometrik aktif
  lastLogin: null
};

// ======= Default Categories (seed) =======
const DEFAULT_CATEGORIES = [
  // Income
  { id: 'cat-gaji',      name: 'Gaji',              icon: 'briefcase',     type: 'income',  isDefault: true },
  { id: 'cat-bonus',     name: 'Bonus',             icon: 'coins',         type: 'income',  isDefault: true },
  { id: 'cat-investasi', name: 'Investasi',         icon: 'trending-up',   type: 'income',  isDefault: true },
  { id: 'cat-hadiah',    name: 'Hadiah',            icon: 'gift',          type: 'income',  isDefault: true },
  { id: 'cat-cashback',  name: 'Cashback',          icon: 'receipt',       type: 'income',  isDefault: true },
  { id: 'cat-sewa',      name: 'Sewa',              icon: 'home',          type: 'income',  isDefault: true },
  { id: 'cat-inc-lain',  name: 'Lainnya',           icon: 'ellipsis',      type: 'income',  isDefault: true },
  // Expense
  { id: 'cat-makanan',   name: 'Makanan & Minuman', icon: 'utensils',      type: 'expense', isDefault: true },
  { id: 'cat-transport', name: 'Transport',         icon: 'car',           type: 'expense', isDefault: true },
  { id: 'cat-belanja',   name: 'Belanja',           icon: 'shopping-bag',  type: 'expense', isDefault: true },
  { id: 'cat-hiburan',   name: 'Hiburan',           icon: 'clapperboard',  type: 'expense', isDefault: true },
  { id: 'cat-kesehatan', name: 'Kesehatan',         icon: 'heart-pulse',   type: 'expense', isDefault: true },
  { id: 'cat-tagihan',   name: 'Tagihan & Utilitas',icon: 'zap',           type: 'expense', isDefault: true },
  { id: 'cat-pendidikan',name: 'Pendidikan',        icon: 'book-open',     type: 'expense', isDefault: true },
  { id: 'cat-pakaian',   name: 'Pakaian & Gaya',    icon: 'shirt',         type: 'expense', isDefault: true },
  { id: 'cat-olahraga',  name: 'Olahraga',          icon: 'dumbbell',      type: 'expense', isDefault: true },
  { id: 'cat-liburan',   name: 'Liburan',           icon: 'plane',         type: 'expense', isDefault: true },
  { id: 'cat-perawatan', name: 'Perawatan',         icon: 'wrench',        type: 'expense', isDefault: true },
  { id: 'cat-exp-lain',  name: 'Lainnya',           icon: 'ellipsis',      type: 'expense', isDefault: true },
];

// ======= Generic helpers =======
function _get(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || null;
  } catch { return null; }
}

function _set(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ======= Init / Seed =======
const Store = {

  init() {
    if (!_get(KEYS.categories)) {
      _set(KEYS.categories, DEFAULT_CATEGORIES);
    }
    if (!_get(KEYS.wallets)) {
      _set(KEYS.wallets, []);
    }
    if (!_get(KEYS.transactions)) {
      _set(KEYS.transactions, []);
    }
    if (!_get(KEYS.settings)) {
      _set(KEYS.settings, { darkMode: false, currency: 'IDR', userName: 'User' });
    }
    if (!_get(KEYS.auth)) {
      _set(KEYS.auth, DEFAULT_AUTH);
    }

    // Pastikan saldo dompet selalu tersinkronisasi 100% dengan transaksi
    this.syncWalletBalances();
  },

  // ======= Authentication & Security =======
  getAuth() {
    return _get(KEYS.auth) || { ...DEFAULT_AUTH };
  },

  saveAuth(auth) {
    _set(KEYS.auth, auth);
  },

  isLoggedIn() {
    const auth = this.getAuth();
    // Jika proteksi kunci aplikasi dimatikan oleh pengguna di pengaturan
    if (!auth.appLockEnabled) return true;

    // Cek sesi aktif di sessionStorage atau rememberMe di localStorage
    const inSession = sessionStorage.getItem(SESSION_AUTH_KEY) === 'true';
    const remembered = localStorage.getItem(REMEMBER_AUTH_KEY) === 'true';
    return inSession || remembered;
  },

  login(username, password, rememberMe = false) {
    const auth = this.getAuth();
    const inputUser = (username || '').trim().toLowerCase();
    const targetUser = (auth.username || 'admin').trim().toLowerCase();

    if (inputUser === targetUser && password === auth.password) {
      sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
      if (rememberMe) {
        localStorage.setItem(REMEMBER_AUTH_KEY, 'true');
      } else {
        localStorage.removeItem(REMEMBER_AUTH_KEY);
      }
      auth.lastLogin = new Date().toISOString();
      this.saveAuth(auth);
      return { success: true };
    }

    return { success: false, message: 'Username atau Password salah!' };
  },

  loginWithBiometrics() {
    const auth = this.getAuth();
    if (!auth.biometricEnabled) {
      return { success: false, message: 'Login biometrik belum diaktifkan di Pengaturan.' };
    }

    sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
    auth.lastLogin = new Date().toISOString();
    this.saveAuth(auth);
    return { success: true };
  },

  logout() {
    sessionStorage.removeItem(SESSION_AUTH_KEY);
    localStorage.removeItem(REMEMBER_AUTH_KEY);
  },

  updateCredentials(currentPassword, newUsername, newPassword) {
    const auth = this.getAuth();
    if (currentPassword !== auth.password) {
      return { success: false, message: 'Password saat ini salah!' };
    }

    if (!newUsername || newUsername.trim() === '') {
      return { success: false, message: 'Username baru tidak boleh kosong!' };
    }

    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'Password baru minimal 4 karakter!' };
    }

    auth.username = newUsername.trim();
    auth.password = newPassword;
    this.saveAuth(auth);
    return { success: true };
  },

  setAppLockEnabled(enabled) {
    const auth = this.getAuth();
    auth.appLockEnabled = !!enabled;
    this.saveAuth(auth);
    if (!enabled) {
      sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
    }
  },

  setBiometricEnabled(enabled) {
    const auth = this.getAuth();
    auth.biometricEnabled = !!enabled;
    this.saveAuth(auth);
  },

  // ======= Settings =======
  getSettings() { return _get(KEYS.settings) || { darkMode: false, currency: 'IDR', userName: 'User' }; },
  saveSettings(settings) { _set(KEYS.settings, settings); },

  // ======= Wallets =======
  getWallets() {
    const rawWallets = _get(KEYS.wallets) || [];
    const transactions = this.getTransactions();

    // Saldo dompet 100% dihitung mengikuti riwayat transaksi yang ada
    return rawWallets.map(w => {
      let bal = 0;
      for (const tx of transactions) {
        const amt = Number(tx.amount) || 0;
        if (tx.type === 'income' && tx.walletId === w.id) {
          bal += amt;
        } else if (tx.type === 'expense' && tx.walletId === w.id) {
          bal -= amt;
        } else if (tx.type === 'transfer') {
          if (tx.walletId === w.id) bal -= amt;
          if (tx.toWalletId === w.id) bal += amt;
        }
      }
      return { ...w, balance: bal };
    });
  },

  syncWalletBalances() {
    const wallets = this.getWallets();
    _set(KEYS.wallets, wallets);
  },

  getWallet(id) { return this.getWallets().find(w => w.id === id); },

  addWallet(wallet) {
    const rawWallets = _get(KEYS.wallets) || [];
    wallet.id = generateId();
    wallet.createdAt = new Date().toISOString();
    wallet.balance = 0;
    rawWallets.push(wallet);
    _set(KEYS.wallets, rawWallets);
    this.syncWalletBalances();
    return wallet;
  },

  updateWallet(id, updates) {
    const rawWallets = _get(KEYS.wallets) || [];
    const wallets = rawWallets.map(w => w.id === id ? { ...w, ...updates } : w);
    _set(KEYS.wallets, wallets);
    this.syncWalletBalances();
  },

  deleteWallet(id) {
    const rawWallets = _get(KEYS.wallets) || [];
    _set(KEYS.wallets, rawWallets.filter(w => w.id !== id));
    // Also delete related transactions
    _set(KEYS.transactions, this.getTransactions().filter(t => t.walletId !== id && t.toWalletId !== id));
    this.syncWalletBalances();
  },

  getTotalBalance() {
    return this.getWallets().reduce((sum, w) => sum + (Number(w.balance) || 0), 0);
  },

  getWalletTransactions(walletId, type = 'all') {
    return this.filterTransactions({ walletId, type });
  },

  getWalletStats(walletId) {
    const txs = this.getWalletTransactions(walletId);
    let income = 0;
    let expense = 0;
    let transferIn = 0;
    let transferOut = 0;

    txs.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income' && t.walletId === walletId) income += amt;
      else if (t.type === 'expense' && t.walletId === walletId) expense += amt;
      else if (t.type === 'transfer') {
        if (t.walletId === walletId) transferOut += amt;
        if (t.toWalletId === walletId) transferIn += amt;
      }
    });

    return {
      txCount: txs.length,
      income,
      expense,
      transferIn,
      transferOut,
      net: income - expense - transferOut + transferIn
    };
  },

  // ======= Transactions =======
  getTransactions() { return _get(KEYS.transactions) || []; },

  getTransaction(id) { return this.getTransactions().find(t => t.id === id); },

  addTransaction(tx) {
    const txs = this.getTransactions();
    tx.id = generateId();
    tx.createdAt = new Date().toISOString();
    txs.push(tx);
    _set(KEYS.transactions, txs);

    // Sinkronisasi saldo dompet mengikuti transaksi
    this.syncWalletBalances();
    return tx;
  },

  deleteTransaction(id) {
    const txs = this.getTransactions().filter(t => t.id !== id);
    _set(KEYS.transactions, txs);

    // Sinkronisasi saldo dompet mengikuti transaksi
    this.syncWalletBalances();
  },

  updateTransaction(id, updates) {
    const tx = this.getTransaction(id);
    if (!tx) return null;

    const updatedTx = { ...tx, ...updates, updatedAt: new Date().toISOString() };
    const txs = this.getTransactions().map(t => t.id === id ? updatedTx : t);
    _set(KEYS.transactions, txs);

    // Sinkronisasi saldo dompet mengikuti transaksi
    this.syncWalletBalances();
    return updatedTx;
  },

  getTotalIncome() {
    return this.getTransactions()
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  },

  getTotalExpense() {
    return this.getTransactions()
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  },

  getTransactionsByType(type = 'all') {
    const list = this.getTransactions().sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
    if (!type || type === 'all') return list;
    return list.filter(t => t.type === type);
  },

  getTodayTransactions(type = 'all') {
    const today = todayISO();
    return this.filterTransactions({ startDate: today, endDate: today, type });
  },

  filterTransactions({ startDate, endDate, type = 'all', walletId = 'all', categoryId = 'all', search = '' } = {}) {
    let list = this.getTransactions();

    if (startDate) {
      list = list.filter(t => {
        const d = t.date || (t.createdAt ? t.createdAt.slice(0, 10) : '');
        return d >= startDate;
      });
    }
    if (endDate) {
      list = list.filter(t => {
        const d = t.date || (t.createdAt ? t.createdAt.slice(0, 10) : '');
        return d <= endDate;
      });
    }
    if (type && type !== 'all') {
      list = list.filter(t => t.type === type);
    }
    if (walletId && walletId !== 'all') {
      list = list.filter(t => t.walletId === walletId || t.toWalletId === walletId);
    }
    if (categoryId && categoryId !== 'all') {
      list = list.filter(t => t.categoryId === categoryId);
    }
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      list = list.filter(t => {
        const cat = this.getCategory(t.categoryId);
        const name = (t.itemName || '').toLowerCase();
        const note = (t.note || '').toLowerCase();
        const catName = (cat?.name || '').toLowerCase();
        return name.includes(q) || note.includes(q) || catName.includes(q);
      });
    }

    return list.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  },

  getRecentTransactions(limit = 5) {
    return this.getTransactions()
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
      .slice(0, limit);
  },

  // ======= Categories =======
  getCategories() { return _get(KEYS.categories) || []; },
  getCategoriesByType(type) { return this.getCategories().filter(c => c.type === type || c.type === 'both'); },
  getCategory(id) { return this.getCategories().find(c => c.id === id); },

  addCategory(category) {
    const cats = this.getCategories();
    category.id = 'cat-custom-' + generateId().slice(0, 8);
    category.isCustom = true;
    cats.push(category);
    _set(KEYS.categories, cats);
    return category;
  },

  updateCategory(id, updates) {
    const cats = this.getCategories().map(c => c.id === id ? { ...c, ...updates } : c);
    _set(KEYS.categories, cats);
    return this.getCategory(id);
  },

  deleteCategory(id, force = false) {
    // Cek apakah kategori sedang digunakan transaksi
    const txs = this.getTransactions();
    const usedTxs = txs.filter(t => t.categoryId === id);
    if (usedTxs.length > 0 && !force) {
      return { success: false, reason: 'Kategori sedang digunakan oleh transaksi yang ada.', txCount: usedTxs.length };
    }

    if (usedTxs.length > 0 && force) {
      // Lepas kategori dari transaksi terkait
      const updatedTxs = txs.map(t => t.categoryId === id ? { ...t, categoryId: null } : t);
      _set(KEYS.transactions, updatedTxs);
    }

    const cats = this.getCategories().filter(c => c.id !== id);
    _set(KEYS.categories, cats);
    return { success: true };
  },

  // ======= Reset =======
  resetAll() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    this.init();
  },
};
