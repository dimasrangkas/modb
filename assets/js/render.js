/* =========================================================================
   PMS · Port Management System
   render.js — komponen render yang dipakai lintas halaman: navigasi, kartu
   KPI, peta pelabuhan SVG, panel cuaca, peringatan, timeline, toast, jam,
   dan unduhan CSV.

   Bergantung pada: utils.js, data.js
   Mengekspor: PMS.render
   ========================================================================= */
(function(PMS){
'use strict';

const {$, $$, renderList, nf, esc, icon, PALETTE, statusColor} = PMS.utils;
const D = PMS.data;
const APP = D.APP;

/* =========================================================================
   KERANGKA HALAMAN (SHELL)

   Topbar, sidebar, panel copilot dan toast identik di seluruh halaman, jadi
   markup-nya dirender dari sini — bukan disalin ke 10 berkas HTML. Tiap
   berkas halaman cukup berisi <main> dengan isi khasnya sendiri.
   ========================================================================= */

/** Sidebar. `currentPage` dicocokkan dengan NAV[].id untuk menandai halaman aktif. */
function renderNav(currentPage){
  $('#sidebar').innerHTML = D.NAV.map(group => `
    <div class="nav-group-label">${group.group}</div>
    ${group.items.map(item => `
      <a class="nav-item" href="${item.href}"${item.id === currentPage ? ' aria-current="page"' : ''}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${item.svg}</svg>${item.label}
      </a>`).join('')}
  `).join('');
}

function renderTopbar(){
  $('#topbar').innerHTML = `
    <div class="brand">
      <a class="brand-home" href="index.html" aria-label="Beranda ${APP.short}">
        <img class="brand-logo" src="assets/img/logo-kkp.svg"
             alt="Lambang Kementerian Kelautan dan Perikanan Republik Indonesia">
      </a>
      <div class="brand-inst">
        <b>Kementerian Kelautan</b>
        <b>dan Perikanan</b>
        <span>Republik Indonesia</span>
      </div>
      <div class="brand-sep"></div>
      <div class="brand-app">
        <b>${APP.short}</b>
        <small>${APP.name}</small>
      </div>
    </div>

    <div class="top-mid">
      <label class="search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
        <input id="globalSearch" type="search" placeholder="Cari kapal, IMO, voyage, dermaga…" aria-label="Pencarian global">
      </label>
    </div>

    <div class="top-right">
      <select class="port-select" id="portSelect" aria-label="Pilih pelabuhan"></select>

      <div class="weather-chip" id="weatherChip">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" aria-hidden="true"><path d="M17.5 19a4.5 4.5 0 000-9 6 6 0 00-11.3-1.8A4 4 0 007 16"/></svg>
        <span id="weatherChipText"></span>
      </div>

      <div class="clock"><b id="clockTime">--:--:--</b><span id="clockDate">-- --- ----</span></div>

      <a class="icon-btn" id="notifBtn" href="messages.html" aria-label="Notifikasi operasional">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        <span class="dot-badge"></span>
      </a>

      <div class="profile">
        <div class="avatar">${APP.user.initials}</div>
        <div class="who"><b>${APP.user.name}</b><span>${APP.user.role}</span></div>
      </div>
    </div>`;
}

/** Panel copilot + toast disisipkan ke akhir <body> di setiap halaman. */
function renderOverlays(){
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <button class="ai-fab" id="aiFab" aria-label="Buka ${APP.short} Copilot">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2" aria-hidden="true"><path d="M12 2l1.8 5.5L19 9l-5.2 1.5L12 16l-1.8-5.5L5 9l5.2-1.5z"/><circle cx="19" cy="19" r="2"/></svg>
    </button>

    <aside class="ai-slide" id="aiSlide" aria-label="${APP.short} Copilot">
      <div class="ai-slide-head">
        <h2><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" aria-hidden="true"><path d="M12 2l1.8 5.5L19 9l-5.2 1.5L12 16l-1.8-5.5L5 9l5.2-1.5z"/></svg></span>${APP.short} Copilot</h2>
        <button class="ai-close" id="aiClose" aria-label="Tutup panel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
      </div>
      <div class="ai-quick" id="aiQuick"></div>
      <div class="ai-chat" id="aiChat"></div>
      <div class="ai-input-row">
        <input id="aiInput" placeholder="Tanyakan apa saja ke copilot…" aria-label="Pertanyaan untuk copilot">
        <button id="aiSend" aria-label="Kirim"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" aria-hidden="true"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg></button>
      </div>
    </aside>

    <div class="toast" id="toast" role="status" aria-live="polite">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
      <span id="toastMsg"></span>
    </div>`;
  while(wrap.firstElementChild) document.body.appendChild(wrap.firstElementChild);
}

/** Footer kredit — dipasang di dasar setiap halaman. */
function renderCredits(){
  const main = $('.main');
  if(!main) return;
  const el = document.createElement('footer');
  el.className = 'credits';
  el.innerHTML = `
    ${APP.short} · ${APP.name.toUpperCase()}<br>
    ${APP.institution}<br>
    Seluruh angka pada halaman ini adalah data simulasi untuk keperluan demonstrasi.`;
  main.appendChild(el);
}

/* =========================================================================
   KARTU KPI
   ========================================================================= */
function kpiCard(k){
  return `<div class="card kpi">
    <div class="top"><div class="ic">${icon(k.icon)}</div></div>
    <div class="label">${k.label}</div>
    <div class="value">${k.value}<small>${k.unit}</small></div>
    <div class="delta ${k.up ? 'up' : 'down'}">${k.up ? '▲' : '▼'} ${k.delta}</div>
  </div>`;
}

/* =========================================================================
   PETA PELABUHAN (SVG)

   Dermaga digambar dari D.BERTH_STATE dan titik kapal dari D.VESSELS,
   sehingga peta selalu sinkron dengan tabel dan KPI.
   ========================================================================= */
const MAP_GEOM = {berthY:206, berthW:58, berthH:40, gap:71, x0:34};
const berthX = i => MAP_GEOM.x0 + i * MAP_GEOM.gap + MAP_GEOM.berthW / 2;

function renderPortMap(){
  const anchorSpots = [[646,132],[712,86],[778,112],[826,64],[736,150]];
  let anchorIdx = 0;

  const berths = D.BERTH_STATE.map((b, i) => {
    const x = MAP_GEOM.x0 + i * MAP_GEOM.gap;
    return `<g>
      <rect x="${x}" y="${MAP_GEOM.berthY}" width="${MAP_GEOM.berthW}" height="${MAP_GEOM.berthH}" rx="4" fill="#FFFFFF" stroke="#E5EEF5"/>
      <rect x="${x}" y="${MAP_GEOM.berthY}" width="${MAP_GEOM.berthW}" height="6" fill="${b.color}"/>
      <text x="${x + MAP_GEOM.berthW / 2}" y="${MAP_GEOM.berthY + 26}" font-size="9" text-anchor="middle" fill="#6B7280">${b.code}</text>
      <title>${esc(b.code)} — ${esc(b.terminal)} (${b.status})</title>
    </g>`;
  }).join('');

  const vessels = D.VESSELS.filter(v => v.status !== 'Departed').map(v => {
    let cx, cy, color;
    const idx = D.BERTHS.findIndex(b => b.code === v.berth);
    if(idx >= 0 && v.status !== 'Arriving'){
      cx = berthX(idx);
      cy = MAP_GEOM.berthY - 8;
      color = statusColor(v.status);
    }else{
      const spot = anchorSpots[anchorIdx++ % anchorSpots.length];
      cx = spot[0];
      cy = spot[1];
      color = v.status === 'Delayed' ? PALETTE.danger : PALETTE.warning;
    }
    return `<g class="vessel-dot">
      <circle cx="${cx}" cy="${cy}" r="6" fill="${color}"><title>${esc(v.name)} · ${esc(v.status)}${v.berth !== '—' ? ' · ' + esc(v.berth) : ''}</title></circle>
      <circle cx="${cx}" cy="${cy}" r="10" fill="none" stroke="${color}" opacity="0.35">
        <animate attributeName="r" values="6;14;6" dur="2.4s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.5;0;0.5" dur="2.4s" repeatCount="indefinite"/>
      </circle>
    </g>`;
  }).join('');

  const wind = Array.from({length:6}, (_, i) => {
    const x = 620 + i * 40, y = 168 + (i % 2) * 18;
    return `<path d="M${x} ${y} l18 -8" stroke="#005B96" stroke-width="2" marker-end="url(#windArrow)"/>`;
  }).join('');

  $('#portMapSvg').innerHTML = `
    <defs>
      <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#E8F6FA"/><stop offset="1" stop-color="#D6EFF7"/>
      </linearGradient>
      <marker id="windArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
        <path d="M0 0L8 4L0 8Z" fill="#005B96"/>
      </marker>
    </defs>

    <rect x="0" y="0" width="900" height="380" fill="url(#seaGrad)" rx="16"/>
    <text x="20" y="26" font-size="10.5" fill="#0077B6" opacity="0.75">Teluk Jakarta</text>
    <path d="M0 262 Q150 236 300 254 Q450 268 600 250 Q750 236 900 254 L900 380 L0 380 Z" fill="#F1F5F8" stroke="#E5EEF5"/>
    <text x="24" y="300" font-size="10.5" fill="#9AA6B2">Daratan Pelabuhan Tanjung Priok · Kali Baru</text>

    <g id="layerBerths">${berths}</g>

    <g id="layerChannel">
      <path d="M430 200 C 440 140, 470 92, 512 44" stroke="#00B4D8" stroke-width="10" stroke-dasharray="2 10" fill="none" opacity="0.5" stroke-linecap="round"/>
      <text x="522" y="44" font-size="10" fill="#00B4D8">Alur Pelayaran Barat</text>
      <ellipse cx="740" cy="110" rx="120" ry="58" fill="rgba(0,119,182,0.05)" stroke="#0077B6" stroke-dasharray="4 4" opacity="0.6"/>
      <text x="740" y="112" font-size="10.5" text-anchor="middle" fill="#0077B6">Area Labuh Jangkar</text>
    </g>

    <g id="layerWind" style="display:none;">${wind}</g>
    <g id="layerVessels">${vessels}</g>
  `;
}

/* =========================================================================
   CUACA & PERINGATAN
   ========================================================================= */
/**
 * Chip cuaca ada di topbar (semua halaman); kartu cuaca lengkap hanya ada di
 * Dashboard — karena itu bagian kartu dilewati bila elemennya tidak ada.
 */
function renderWeather(port){
  const w = port.weather;

  const chip = $('#weatherChipText');
  if(chip) chip.innerHTML = `<b>${esc(w.cond.split(', ')[1] || '')}</b> ${esc(w.wind)}`;

  const container = $('#weatherRows');
  if(!container) return;

  const rows = [
    ['Kondisi', w.cond], ['Angin', w.wind], ['Jarak Pandang', w.vis],
    ['Tinggi Gelombang', w.wave], ['Wilayah Perairan', w.area],
    ['Pasang Tertinggi', w.high], ['Surut Terendah', w.low], ['Tinggi Muka Air', w.level]
  ];
  renderList(container, rows, r => `<div class="tide-row"><span>${r[0]}</span><b>${esc(r[1])}</b></div>`);

  const note = $('#weatherNote');
  if(note) note.textContent =
    'Format mengikuti prakiraan cuaca maritim BMKG dan data pasang surut Pushidrosal — nilai simulasi.';
}

function renderAlerts(){
  renderList($('#alertList'), D.ALERTS, a => `
    <div class="alert-item">
      <div class="alert-sev ${a.sev}"></div>
      <div><div class="alert-title">${esc(a.title)}</div><div class="alert-meta">${esc(a.meta)}</div></div>
    </div>`);
}

/* =========================================================================
   TIMELINE ETA / ETD
   ========================================================================= */
function buildAxis(container){
  container.innerHTML = '<span class="lbl"></span>' + D.HOURS_24.map(h => `<span>${h}</span>`).join('');
}

function buildTimeline(container, vessels){
  renderList(container, vessels, v => `
    <div class="tl-row">
      <div class="tl-name">${esc(v.name)}<small>${esc(v.voyage)} · ${esc(v.berth)}</small></div>
      <div class="tl-track">
        <div class="tl-bar" style="left:${v.startPct.toFixed(2)}%;width:${Math.max(v.durPct, 5).toFixed(2)}%;background:${statusColor(v.status)}">
          ${esc(v.status)} · ${esc(v.eta)}–${esc(v.etd)}
        </div>
      </div>
    </div>`);
}

/* =========================================================================
   TOAST, JAM, EKSPOR CSV
   ========================================================================= */
let toastTimer;
function showToast(msg){
  const t = $('#toast');
  $('#toastMsg').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

function tickClock(){
  const now = new Date();
  $('#clockTime').textContent = now.toLocaleTimeString('id-ID', {hour12:false});
  $('#clockDate').textContent = now.toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'}) + ' WIB';
}

/** Unduh array-of-rows sebagai CSV. BOM UTF-8 agar terbaca benar di Excel. */
function downloadCSV(filename, rows){
  const csv  = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], {type:'text/csv;charset=utf-8;'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* =========================================================================
   EKSPOR
   ========================================================================= */
PMS.render = {
  renderNav, renderTopbar, renderOverlays, renderCredits,
  kpiCard,
  renderPortMap, renderWeather, renderAlerts,
  buildAxis, buildTimeline,
  showToast, tickClock, downloadCSV
};

})(window.PMS = window.PMS || {});
