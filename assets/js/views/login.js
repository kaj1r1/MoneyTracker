// ========================================
// login.js — Halaman Login & Verifikasi Biometrik
// ========================================

/**
 * Render Halaman Login Utama
 */
function renderLogin() {
  const content = document.getElementById('app-content');
  if (!content) return;

  const auth = Store.getAuth();

  content.innerHTML = `
    <div class="min-h-[85vh] flex flex-col justify-center py-4 sm:py-8 max-w-sm mx-auto">

      <!-- ======= 1. BRANDING & LOGO ======= -->
      <div class="text-center mb-6">
        <div class="relative w-20 h-20 mx-auto mb-3.5">
          <div class="w-20 h-20 rounded-[28px] bg-gradient-to-tr from-green-950 via-green-900 to-green-800 border-2 border-lime-400/40 shadow-xl flex items-center justify-center text-lime-400">
            <i data-lucide="shield-check" class="w-10 h-10"></i>
          </div>
          <div class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-lime-400 text-green-950 flex items-center justify-center font-bold shadow-md">
            <i data-lucide="wallet" class="w-4 h-4"></i>
          </div>
          <!-- Ambient glow -->
          <div class="absolute inset-0 bg-lime-400/20 rounded-full blur-xl pointer-events-none"></div>
        </div>

        <h1 class="text-2xl font-black text-gray-900 dark:text-green-50 tracking-tight">Personal Wallet</h1>
        <p class="text-xs text-gray-400 dark:text-green-300/70 font-medium mt-1">Keamanan & pelacakan keuangan pribadi</p>
      </div>

      <!-- ======= 2. KARTU LOGIN UTAMA ======= -->
      <div class="bg-white dark:bg-[#132A23] rounded-[30px] p-5 sm:p-6 shadow-xl border border-gray-100 dark:border-[#1F4A3C] relative overflow-hidden">

        <!-- Header Card -->
        <div class="mb-4 text-center">
          <h2 class="text-lg font-extrabold text-gray-900 dark:text-green-50">Selamat Datang Kembali</h2>
          <p class="text-xs text-gray-400 dark:text-green-300/60 mt-0.5">Silakan masuk untuk mengakses data dompetmu</p>
        </div>

        <!-- Info Kredensial Default (Dapat Ditutup / Diubah di Pengaturan) -->
        <div class="mb-4 p-2.5 rounded-xl bg-lime-500/10 dark:bg-lime-400/10 border border-lime-500/25 dark:border-lime-400/25 flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <i data-lucide="info" class="w-4 h-4 text-lime-600 dark:text-lime-400 flex-shrink-0"></i>
            <span class="text-[11px] text-gray-700 dark:text-green-200">
              Default: <strong class="text-green-800 dark:text-lime-300 font-bold">${escapeHtml(auth.username || 'admin')}</strong> / <strong class="text-green-800 dark:text-lime-300 font-bold">${escapeHtml(auth.password || 'password123')}</strong>
            </span>
          </div>
          <button
            type="button"
            onclick="fillDemoCredentials()"
            class="text-[10px] font-bold text-green-700 dark:text-lime-400 underline hover:text-green-900">
            Isi Otomatis
          </button>
        </div>

        <!-- Error Message Alert Box -->
        <div id="loginErrorMessage" class="hidden mb-3.5 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <i data-lucide="alert-circle" class="w-4 h-4 flex-shrink-0"></i>
          <span id="loginErrorText" class="text-[11px] font-semibold">Username atau Password salah!</span>
        </div>

        <!-- Form Login Username & Password -->
        <form onsubmit="handlePasswordLoginSubmit(event)" class="space-y-3">
          <!-- Field 1: Username -->
          <div>
            <label class="block text-xs font-semibold text-gray-600 dark:text-green-300/70 mb-1">Username</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <i data-lucide="user" class="w-4 h-4"></i>
              </span>
              <input
                type="text"
                id="loginUsernameInput"
                required
                autocomplete="username"
                placeholder="Masukkan username..."
                value="${escapeHtml(auth.username || 'admin')}"
                class="w-full h-11 pl-10 pr-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A3B31] text-gray-900 dark:text-green-50 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>
          </div>

          <!-- Field 2: Password -->
          <div>
            <label class="block text-xs font-semibold text-gray-600 dark:text-green-300/70 mb-1">Password</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <i data-lucide="lock" class="w-4 h-4"></i>
              </span>
              <input
                type="password"
                id="loginPasswordInput"
                required
                autocomplete="current-password"
                placeholder="Masukkan password..."
                value="${escapeHtml(auth.password || 'password123')}"
                class="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A3B31] text-gray-900 dark:text-green-50 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
              <button
                type="button"
                onclick="toggleLoginPasswordVisibility()"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-green-300 p-1">
                <i id="passwordToggleIcon" data-lucide="eye" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <!-- Baris: Ingat Saya & Lupa Password -->
          <div class="flex items-center justify-between text-xs pt-0.5">
            <label class="flex items-center gap-2 cursor-pointer select-none text-gray-600 dark:text-green-200/80">
              <input
                type="checkbox"
                id="loginRememberMeCheckbox"
                class="rounded border-gray-300 text-green-600 focus:ring-green-500 w-3.5 h-3.5"
                checked
              />
              <span class="text-[11px] font-medium">Ingat Saya</span>
            </label>
            <button
              type="button"
              onclick="showPasswordHintModal()"
              class="text-[11px] font-bold text-green-600 dark:text-lime-400 hover:underline">
              Bantuan Akun?
            </button>
          </div>

          <!-- Tombol Submit Login Password -->
          <button
            type="submit"
            id="loginSubmitBtn"
            class="w-full mt-1.5 py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer">
            <i data-lucide="log-in" class="w-4 h-4"></i>
            <span>Masuk ke Aplikasi</span>
          </button>
        </form>

        <!-- Divider Atau Masuk Biometrik -->
        <div class="relative my-4 text-center">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200 dark:border-gray-800"></div>
          </div>
          <span class="relative px-3 bg-white dark:bg-[#132A23] text-[11px] font-semibold text-gray-400 dark:text-green-300/60 uppercase tracking-wider">
            atau verifikasi instan
          </span>
        </div>

        <!-- ======= 3. TOMBOL LOGIN BIOMETRIK (SIDIK JARI / FACE ID) ======= -->
        <button
          type="button"
          onclick="handleBiometricLoginClick()"
          class="w-full p-3 rounded-2xl bg-gradient-to-r from-green-950 via-green-900 to-green-800 hover:from-green-900 hover:to-green-700 text-white border border-green-700/60 shadow-lg flex items-center justify-between transition-all cursor-pointer group active:scale-[0.98]">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-lime-400/20 border border-lime-400/30 text-lime-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
              <i data-lucide="fingerprint" class="w-5 h-5"></i>
            </div>
            <div class="text-left">
              <p class="text-xs sm:text-sm font-bold text-white group-hover:text-lime-300 transition-colors">
                Masuk dengan Biometrik
              </p>
              <p class="text-[10px] text-green-300/70">
                Sidik Jari / Touch ID / Face Unlock
              </p>
            </div>
          </div>
          <div class="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-lime-400 group-hover:translate-x-0.5 transition-transform">
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </div>
        </button>

      </div>

      <!-- ======= 4. FOOTER INFORMASI ======= -->
      <div class="text-center mt-5 text-[11px] text-gray-400 dark:text-green-300/60">
        <p class="flex items-center justify-center gap-1.5 font-medium">
          <i data-lucide="lock" class="w-3.5 h-3.5 text-lime-500"></i>
          <span>Tersimpan aman di perangkat lokal Anda</span>
        </p>
      </div>

    </div>
  `;

  lucide.createIcons();
}

/**
 * Toggle tampil / sembunyikan password
 */
function toggleLoginPasswordVisibility() {
  const input = document.getElementById('loginPasswordInput');
  const icon = document.getElementById('passwordToggleIcon');
  if (!input || !icon) return;

  if (input.type === 'password') {
    input.type = 'text';
    icon.setAttribute('data-lucide', 'eye-off');
  } else {
    input.type = 'password';
    icon.setAttribute('data-lucide', 'eye');
  }
  lucide.createIcons();
}

/**
 * Isi otomatis username & password demo
 */
function fillDemoCredentials() {
  const auth = Store.getAuth();
  const userInput = document.getElementById('loginUsernameInput');
  const passInput = document.getElementById('loginPasswordInput');
  if (userInput) userInput.value = auth.username || 'admin';
  if (passInput) passInput.value = auth.password || 'password123';

  // Animasi singkat
  userInput?.classList.add('ring-2', 'ring-lime-400');
  passInput?.classList.add('ring-2', 'ring-lime-400');
  setTimeout(() => {
    userInput?.classList.remove('ring-2', 'ring-lime-400');
    passInput?.classList.remove('ring-2', 'ring-lime-400');
  }, 400);
}

/**
 * Submit handler form password login
 */
function handlePasswordLoginSubmit(e) {
  e.preventDefault();

  const username = document.getElementById('loginUsernameInput')?.value.trim();
  const password = document.getElementById('loginPasswordInput')?.value;
  const rememberMe = document.getElementById('loginRememberMeCheckbox')?.checked;

  const result = Store.login(username, password, rememberMe);

  if (result.success) {
    hideLoginErrorMessage();
    playBiometricSuccessSound();

    // Feedback tombol
    const submitBtn = document.getElementById('loginSubmitBtn');
    if (submitBtn) {
      submitBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-lime-300"></i> Berhasil Masuk...`;
      lucide.createIcons();
    }

    setTimeout(() => {
      App.unlockAndNavigate('#/dashboard');
    }, 300);
  } else {
    showLoginErrorMessage(result.message || 'Username atau Password salah!');
  }
}

/**
 * Tampilkan pesan error pada form login
 */
function showLoginErrorMessage(msg) {
  const errorBox = document.getElementById('loginErrorMessage');
  const errorText = document.getElementById('loginErrorText');
  if (errorBox && errorText) {
    errorText.textContent = msg;
    errorBox.classList.remove('hidden');
    errorBox.classList.add('animate-shake');
    setTimeout(() => errorBox.classList.remove('animate-shake'), 500);
  }
}

function hideLoginErrorMessage() {
  const errorBox = document.getElementById('loginErrorMessage');
  if (errorBox) errorBox.classList.add('hidden');
}

/**
 * Klik tombol biometrik di halaman login
 */
function handleBiometricLoginClick() {
  const auth = Store.getAuth();

  if (!auth.biometricEnabled) {
    alert('Login Biometrik saat ini dinonaktifkan di Pengaturan.\nSilakan masuk dengan username & password, lalu aktifkan di menu Pengaturan > Keamanan.');
    return;
  }

  openBiometricScannerModal({
    title: 'Verifikasi Biometrik',
    subtitle: 'Sentuh sensor sidik jari perangkat atau arahkan wajah ke layar',
    onSuccess: () => {
      Store.loginWithBiometrics();
      App.unlockAndNavigate('#/dashboard');
    }
  });
}

/**
 * Tampilkan modal bantuan kredensial
 */
function showPasswordHintModal() {
  const auth = Store.getAuth();
  alert(`Bantuan Akses Akun:\n\n• Username Saat Ini: ${auth.username}\n• Password Saat Ini: ${auth.password}\n\nAnda dapat mengganti username dan password ini kapan saja melalui menu Pengaturan > Keamanan.`);
}

// ========================================
// BIOMETRIC SCANNER MODAL (UNIVERSAL / WEBAUTHN + FALLBACK)
// ========================================

let biometricScannerTimer = null;

/**
 * Buka modal pemindaian sidik jari / face unlock
 */
function openBiometricScannerModal(options = {}) {
  const overlay = document.getElementById('biometricModalOverlay');
  const container = document.getElementById('biometricModalDrawer');
  if (!overlay || !container) return;

  const title = options.title || 'Verifikasi Biometrik';
  const subtitle = options.subtitle || 'Tempelkan jari Anda pada sensor sidik jari';
  const onSuccess = options.onSuccess || (() => {});

  // Reset UI status
  document.getElementById('bioScannerTitle').textContent = title;
  document.getElementById('bioScannerSubtitle').textContent = subtitle;
  
  const iconBox = document.getElementById('bioScannerIconBox');
  const statusBadge = document.getElementById('bioScannerStatusBadge');
  const icon = document.getElementById('bioScannerIcon');

  iconBox.className = 'w-24 h-24 mx-auto rounded-3xl bg-green-950 border-2 border-lime-400 text-lime-400 flex items-center justify-center relative overflow-hidden shadow-2xl transition-all duration-300';
  icon.setAttribute('data-lucide', 'fingerprint');
  statusBadge.textContent = 'Memindai Sidik Jari...';
  statusBadge.className = 'text-xs font-bold text-lime-600 dark:text-lime-400 bg-lime-50 dark:bg-lime-950/60 border border-lime-200 dark:border-lime-900/60 px-3 py-1 rounded-full animate-pulse';

  overlay.classList.remove('hidden');
  setTimeout(() => {
    overlay.classList.remove('opacity-0');
    container.classList.remove('scale-95', 'opacity-0');
    container.classList.add('scale-100', 'opacity-100');
  }, 10);

  lucide.createIcons();

  // Jalankan simulasi pemindaian biometrik / WebAuthn
  if (biometricScannerTimer) clearTimeout(biometricScannerTimer);

  biometricScannerTimer = setTimeout(() => {
    // Sukses terverifikasi
    playBiometricSuccessSound();

    if (navigator.vibrate) {
      try { navigator.vibrate([40, 50, 40]); } catch (e) {}
    }

    iconBox.className = 'w-24 h-24 mx-auto rounded-3xl bg-lime-400 text-green-950 border-2 border-lime-300 flex items-center justify-center relative overflow-hidden shadow-2xl scale-105 transition-all duration-300';
    icon.setAttribute('data-lucide', 'check-circle-2');
    statusBadge.textContent = '✓ Biometrik Berhasil Diverifikasi!';
    statusBadge.className = 'text-xs font-bold text-white bg-green-600 px-3 py-1 rounded-full shadow-sm';
    lucide.createIcons();

    setTimeout(() => {
      closeBiometricScannerModal();
      onSuccess();
    }, 700);

  }, 1200);
}

/**
 * Tutup modal pemindai biometrik
 */
function closeBiometricScannerModal() {
  if (biometricScannerTimer) clearTimeout(biometricScannerTimer);

  const overlay = document.getElementById('biometricModalOverlay');
  const container = document.getElementById('biometricModalDrawer');
  if (!overlay || !container) return;

  container.classList.remove('scale-100', 'opacity-100');
  container.classList.add('scale-95', 'opacity-0');
  overlay.classList.add('opacity-0');
  setTimeout(() => overlay.classList.add('hidden'), 200);
}
