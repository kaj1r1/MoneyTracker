// ========================================
// app.js — SPA Router & Initialization
// ========================================

const App = {
  currentView: null,

  init() {
    // Init store & seed data
    Store.init();

    // Seed demo data if no wallets exist
    this.seedDemoData();

    // Apply dark mode from settings
    const settings = Store.getSettings();
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    }

    // Listen for hash changes
    window.addEventListener('hashchange', () => this.route());

    // Initial route
    this.route();
  },

  route() {
    const hash = window.location.hash || '#/dashboard';
    const content = document.getElementById('app-content');

    // Remove old animation, force reflow, re-apply
    content.classList.remove('animate-fade-in');
    void content.offsetWidth;
    content.classList.add('animate-fade-in');

    // Update active nav
    this.updateNav(hash);

    // Route to view
    if (hash.startsWith('#/wallet/')) {
      const walletId = hash.replace('#/wallet/', '');
      this.currentView = 'wallet-detail';
      renderWalletDetail(walletId);
    } else if (hash.startsWith('#/transaction/')) {
      const txId = hash.replace('#/transaction/', '');
      this.currentView = 'transaction-detail';
      renderTransactionDetail(txId);
    } else {
      switch (hash) {
        case '#/':
        case '#/dashboard':
          this.currentView = 'dashboard';
          renderDashboard();
          break;
        case '#/transactions':
          this.currentView = 'transactions';
          renderTransactions();
          break;
        case '#/wallets':
          this.currentView = 'wallets';
          renderWallets();
          break;
        case '#/weekly':
        case '#/stats':
          this.currentView = 'stats';
          renderStats();
          break;
        case '#/settings':
          this.currentView = 'settings';
          renderSettings();
          break;
        case '#/categories':
          this.currentView = 'settings';
          renderSettings('categories');
          break;
        default:
          this.currentView = 'dashboard';
          renderDashboard();
      }
    }

    // Re-init Lucide icons
    lucide.createIcons();
  },

  updateNav(hash) {
    document.querySelectorAll('.nav-item').forEach(btn => {
      const target = btn.getAttribute('data-nav');
      const label = btn.getAttribute('data-label') || '';
      const isActive = hash.startsWith(target) ||
        ((hash === '#/' || hash === '' || hash === '#') && target === '#/dashboard') ||
        (hash.startsWith('#/wallet/') && target === '#/wallets') ||
        ((hash.startsWith('#/weekly') || hash.startsWith('#/stats')) && target === '#/weekly');

      // Get the icon element (first <i>)
      const icon = btn.querySelector('i');
      const iconName = icon ? icon.getAttribute('data-lucide') : '';

      if (isActive) {
        // Active: lime pill with icon + label
        btn.className = 'nav-item nav-active flex items-center gap-1.5 bg-lime-400 text-green-900 px-3.5 py-2 rounded-full font-semibold text-sm transition-all duration-200';
        // Ensure label span exists
        let labelSpan = btn.querySelector('.nav-label');
        if (!labelSpan) {
          labelSpan = document.createElement('span');
          labelSpan.className = 'nav-label text-[13px]';
          btn.appendChild(labelSpan);
        }
        labelSpan.textContent = label;
        // Icon size for active
        if (icon) { icon.className = ''; icon.setAttribute('data-lucide', iconName); }
      } else {
        // Inactive: icon only, no label
        btn.className = 'nav-item p-2.5 rounded-full text-green-300/60 hover:text-green-100 transition-all duration-200';
        // Remove label span if exists
        const labelSpan = btn.querySelector('.nav-label');
        if (labelSpan) labelSpan.remove();
        // Icon size for inactive
        if (icon) { icon.className = ''; icon.setAttribute('data-lucide', iconName); }
      }
    });

    // Re-create Lucide icons after DOM changes
    lucide.createIcons();
  },

  seedDemoData() {
    if (Store.getWallets().length > 0) return;

    // Add demo wallets (saldo awal 0, saldo terisi murni dari transaksi)
    const bca = Store.addWallet({ name: 'BCA', color: '#14532D', icon: 'landmark' });
    const gopay = Store.addWallet({ name: 'GoPay', color: '#0369A1', icon: 'credit-card' });
    const ovo = Store.addWallet({ name: 'OVO', color: '#F97316', icon: 'smartphone' });
    const tunai = Store.addWallet({ name: 'Tunai', color: '#7C2D12', icon: 'banknote' });

    // Add demo transactions
    const today = todayISO();
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().slice(0, 10);

    // Initial income deposits
    Store.addTransaction({ type: 'income', walletId: bca.id, amount: 4000000, categoryId: 'cat-gaji', itemName: 'Gaji Bulanan', note: 'Payroll BCA', date: twoDaysAgo });
    Store.addTransaction({ type: 'income', walletId: ovo.id, amount: 500000, categoryId: 'cat-bonus', itemName: 'Bonus Project', note: 'Top up OVO', date: twoDaysAgo });
    Store.addTransaction({ type: 'income', walletId: tunai.id, amount: 1200000, categoryId: 'cat-cashback', itemName: 'Tarik Tunai ATM', note: 'Uang tunai dompet', date: twoDaysAgo });
    Store.addTransaction({ type: 'transfer', walletId: bca.id, toWalletId: gopay.id, amount: 1000000, categoryId: null, itemName: null, note: 'Top up GoPay dari BCA', date: yesterday });

    // Expenses
    Store.addTransaction({ type: 'expense', walletId: bca.id, amount: 35000, categoryId: 'cat-makanan', itemName: 'Nasi Goreng Spesial', note: 'Makan siang', date: yesterday });
    Store.addTransaction({ type: 'expense', walletId: gopay.id, amount: 25000, categoryId: 'cat-transport', itemName: 'Grab ke Kantor', note: null, date: yesterday });
    Store.addTransaction({ type: 'expense', walletId: bca.id, amount: 150000, categoryId: 'cat-belanja', itemName: 'Kabel USB-C', note: 'Tokopedia', date: today });
    Store.addTransaction({ type: 'expense', walletId: tunai.id, amount: 45000, categoryId: 'cat-makanan', itemName: 'Kopi + Roti', note: 'Starbucks', date: today });
    Store.addTransaction({ type: 'transfer', walletId: bca.id, toWalletId: gopay.id, amount: 200000, categoryId: null, itemName: null, note: 'Top up GoPay', date: today });
  },
};

// Start app
document.addEventListener('DOMContentLoaded', () => App.init());
