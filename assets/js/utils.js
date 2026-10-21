// ========================================
// utils.js — Helper functions
// ========================================

/**
 * Generate UUID v4
 */
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

/**
 * Format angka ke Rupiah: 5000000 → "Rp 5.000.000"
 */
function formatCurrency(amount) {
  return 'Rp ' + Math.abs(amount).toLocaleString('id-ID');
}

/**
 * Format angka Rupiah ringkas: 5500000 → "Rp 5,5Jt"
 */
function formatCurrencyShort(amount) {
  const abs = Math.abs(amount);
  if (abs >= 1000000000) return 'Rp ' + (abs / 1000000000).toFixed(1).replace('.0', '') + 'M';
  if (abs >= 1000000) return 'Rp ' + (abs / 1000000).toFixed(1).replace('.0', '') + 'Jt';
  if (abs >= 1000) return 'Rp ' + (abs / 1000).toFixed(0) + 'K';
  return 'Rp ' + abs;
}

/**
 * Format tanggal: "2026-10-05" → "05 Okt 2026"
 */
function formatDate(dateStr) {
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format tanggal pendek: "2026-10-05" → "05 Okt"
 */
function formatDateShort(dateStr) {
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]}`;
}

/**
 * Format waktu: ISO string → "14:30"
 */
function formatTime(isoString) {
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * Tanggal hari ini format YYYY-MM-DD
 */
function todayISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/**
 * Tanggal X hari yang lalu format YYYY-MM-DD
 */
function daysAgoISO(days) {
  const d = new Date(Date.now() - days * 86400000);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/**
 * Tanggal awal bulan ini format YYYY-MM-DD
 */
function startOfMonthISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-01';
}

/**
 * Tanggal akhir bulan ini format YYYY-MM-DD
 */
function endOfMonthISO() {
  const d = new Date();
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(lastDay).padStart(2, '0');
}

/**
 * Tanggal awal bulan lalu format YYYY-MM-DD
 */
function startOfLastMonthISO() {
  const d = new Date();
  const prevMonth = new Date(d.getFullYear(), d.getMonth() - 1, 1);
  return prevMonth.getFullYear() + '-' + String(prevMonth.getMonth() + 1).padStart(2, '0') + '-01';
}

/**
 * Tanggal akhir bulan lalu format YYYY-MM-DD
 */
function endOfLastMonthISO() {
  const d = new Date();
  const lastDay = new Date(d.getFullYear(), d.getMonth(), 0).getDate();
  const prevMonth = new Date(d.getFullYear(), d.getMonth() - 1, 1);
  return prevMonth.getFullYear() + '-' + String(prevMonth.getMonth() + 1).padStart(2, '0') + '-' + String(lastDay).padStart(2, '0');
}

/**
 * Format header tanggal untuk pengelompokan list
 */
function formatDateGroupHeader(dateStr) {
  if (!dateStr) return 'Lainnya';
  const today = todayISO();
  const yesterday = daysAgoISO(1);

  if (dateStr === today) return 'Hari Ini';
  if (dateStr === yesterday) return 'Kemarin';

  return formatDate(dateStr);
}

/**
 * Greeting berdasarkan waktu
 */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

/**
 * Utility escape HTML
 */
function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

/**
 * Category background color mapping
 */
function getCategoryBgColor(icon) {
  const map = {
    'utensils': 'bg-orange-100 dark:bg-orange-950/50',
    'car': 'bg-blue-100 dark:bg-blue-950/50',
    'shopping-bag': 'bg-amber-100 dark:bg-amber-950/50',
    'clapperboard': 'bg-purple-100 dark:bg-purple-950/50',
    'film': 'bg-purple-100 dark:bg-purple-950/50',
    'heart-pulse': 'bg-rose-100 dark:bg-rose-950/50',
    'zap': 'bg-yellow-100 dark:bg-yellow-950/50',
    'book-open': 'bg-indigo-100 dark:bg-indigo-950/50',
    'shirt': 'bg-pink-100 dark:bg-pink-950/50',
    'dumbbell': 'bg-cyan-100 dark:bg-cyan-950/50',
    'plane': 'bg-sky-100 dark:bg-sky-950/50',
    'wrench': 'bg-teal-100 dark:bg-teal-950/50',
    'coffee': 'bg-amber-100 dark:bg-amber-950/50',
    'briefcase': 'bg-emerald-100 dark:bg-emerald-950/50',
    'coins': 'bg-yellow-100 dark:bg-yellow-950/50',
    'trending-up': 'bg-green-100 dark:bg-green-950/50',
    'gift': 'bg-pink-100 dark:bg-pink-950/50',
    'receipt': 'bg-blue-100 dark:bg-blue-950/50',
    'home': 'bg-emerald-100 dark:bg-emerald-950/50',
  };
  return map[icon] || 'bg-gray-100 dark:bg-gray-800';
}

/**
 * Category icon text color mapping
 */
function getCategoryIconColor(icon) {
  const map = {
    'utensils': 'text-orange-600 dark:text-orange-400',
    'car': 'text-blue-600 dark:text-blue-400',
    'shopping-bag': 'text-amber-600 dark:text-amber-400',
    'clapperboard': 'text-purple-600 dark:text-purple-400',
    'film': 'text-purple-600 dark:text-purple-400',
    'heart-pulse': 'text-rose-600 dark:text-rose-400',
    'zap': 'text-yellow-600 dark:text-yellow-400',
    'book-open': 'text-indigo-600 dark:text-indigo-400',
    'shirt': 'text-pink-600 dark:text-pink-400',
    'dumbbell': 'text-cyan-600 dark:text-cyan-400',
    'plane': 'text-sky-600 dark:text-sky-400',
    'wrench': 'text-teal-600 dark:text-teal-400',
    'coffee': 'text-amber-600 dark:text-amber-400',
    'briefcase': 'text-emerald-600 dark:text-emerald-400',
    'coins': 'text-yellow-600 dark:text-yellow-400',
    'trending-up': 'text-green-600 dark:text-green-400',
    'gift': 'text-pink-600 dark:text-pink-400',
    'receipt': 'text-blue-600 dark:text-blue-400',
    'home': 'text-emerald-600 dark:text-emerald-400',
  };
  return map[icon] || 'text-gray-500 dark:text-gray-400';
}

