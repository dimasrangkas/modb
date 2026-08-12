/* =========================================================================
   PMS · Port Management System
   utils.js — helper DOM, format angka, ikon, dan pemetaan warna status.

   Tidak bergantung pada berkas lain. Dimuat PERTAMA.
   Mengekspor: PMS.utils
   ========================================================================= */
(function(PMS){
'use strict';

/* ------------------------------------------------------------ helper DOM */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** Render daftar item ke container dengan satu kali tulis DOM. */
function renderList(container, items, template){
  container.innerHTML = items.map(template).join('');
}

/**
 * addEventListener yang aman terhadap elemen yang tidak ada.
 * Dibutuhkan karena tiap halaman hanya memuat sebagian kontrol: pemasangan
 * listener dijalankan dari app.js yang sama untuk semua halaman.
 */
function on(target, event, handler){
  const el = typeof target === 'string' ? $(target) : target;
  if(el) el.addEventListener(event, handler);
  return el;
}

/**
 * Penyimpanan preferensi antar halaman (mis. pelabuhan yang dipilih).
 * Sebagian browser melempar SecurityError saat mengakses localStorage dari
 * file://, jadi selalu ada fallback ke memori — preferensi tetap berfungsi
 * dalam satu halaman, hanya tidak bertahan saat pindah halaman.
 */
const memoryStore = Object.create(null);
const store = {
  get(key){
    try{
      const value = localStorage.getItem(key);
      if(value !== null) return value;
    }catch(e){ /* file:// — abaikan */ }
    return memoryStore[key] ?? null;
  },
  set(key, value){
    memoryStore[key] = value;
    try{ localStorage.setItem(key, value); }catch(e){ /* file:// — abaikan */ }
  }
};

/** Baca satu parameter dari query string, mis. vessel-board.html?q=kelud */
function queryParam(name){
  return new URLSearchParams(window.location.search).get(name) || '';
}

/* --------------------------------------------------------------- format */
/** Format angka gaya Indonesia: 18.420 · 1,4 */
const nf = (n, dec = 0) =>
  n.toLocaleString('id-ID', {minimumFractionDigits:dec, maximumFractionDigits:dec});

/** "14:35" -> 14.583 (jam desimal) */
function toHours(hhmm){
  const [h, m] = hhmm.split(':').map(Number);
  return h + m / 60;
}

/** Escape teks sebelum disisipkan ke template HTML. */
const esc = str => String(str).replace(/[&<>"]/g,
  c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/**
 * PRNG deterministik. Dipakai HANYA untuk tekstur visual (heatmap, lapangan
 * penumpukan), bukan untuk angka operasional — supaya tampilan tetap sama
 * di setiap reload.
 */
function seededRandom(seed){
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

/* ----------------------------------------------------------------- ikon */
const ICONS = {
  arrival:    '<path d="M3 17l2-7h14l2 7"/><path d="M7 10V6h10v4"/><path d="M2 21c2 1 4 1 6 0s4-1 6 0 4 1 6 0"/>',
  departure:  '<path d="M13 5l7 7-7 7"/><path d="M4 12h16"/>',
  cargo:      '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M3 12h18M9 7V5h6v2"/>',
  berth:      '<path d="M4 21V9l8-6 8 6v12"/><path d="M9 21v-6h6v6"/>',
  passenger:  '<circle cx="9" cy="8" r="3"/><path d="M2 21c0-3.5 3-6 7-6s7 2.5 7 6"/><circle cx="18" cy="9" r="2.3"/><path d="M15 21c.3-2.5 2-4.3 4-4.3s3.7 1.8 4 4.3"/>',
  crane:      '<path d="M4 21h9M6 21V9l10-5v6M16 10v11M11 10h9"/>',
  occupancy:  '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 15h18"/>',
  delay:      '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  revenue:    '<path d="M12 2v20M17 6H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>',
  movement:   '<path d="M3 17l2-7h14l2 7"/><path d="M7 10V6h10v4"/>',
  volume:     '<rect x="3" y="7" width="18" height="13" rx="2"/>',
  turnaround: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  utilization:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 3v18M16 3v18"/>',
  yard:       '<rect x="3" y="4" width="7" height="7" rx="1"/><rect x="14" y="4" width="7" height="7" rx="1"/><rect x="3" y="13" width="7" height="7" rx="1"/><rect x="14" y="13" width="7" height="7" rx="1"/>',
  clock:      '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'
};

const icon = (name, stroke = 1.8) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" aria-hidden="true">${ICONS[name]}</svg>`;

/* -------------------------------------------------- warna & badge status */
const PALETTE = {
  success:'#2A9D8F', primary:'#0077B6', accent:'#00B4D8',
  secondary:'#005B96', warning:'#F4A261', danger:'#E76F51', muted:'#9AA6B2'
};

const BADGE_CLASS = {
  Berthed:'g', Completed:'g', Cleared:'g',
  Arriving:'b', Loading:'b', Discharging:'b', 'In Review':'b',
  Delayed:'r', Held:'r',
  Departed:'gray',
  Pending:'y', Waiting:'y'
};

const STATUS_COLOR = {
  Berthed:PALETTE.success, Completed:PALETTE.success, Cleared:PALETTE.success,
  Arriving:PALETTE.primary, Loading:PALETTE.primary, Discharging:PALETTE.primary,
  Delayed:PALETTE.danger, Departed:PALETTE.muted
};

const badgeClass  = s => BADGE_CLASS[s] || 'y';
const statusColor = s => STATUS_COLOR[s] || PALETTE.warning;
const badge       = s => `<span class="badge ${badgeClass(s)}"><i></i>${esc(s)}</span>`;

/* --------------------------------------------------------------- ekspor */
PMS.utils = {
  $, $$, renderList, on,
  nf, toHours, esc, seededRandom,
  store, queryParam,
  ICONS, icon,
  PALETTE, badge, badgeClass, statusColor
};

})(window.PMS = window.PMS || {});
