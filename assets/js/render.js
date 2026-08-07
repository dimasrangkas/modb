/* =========================================================================
   PODB · Port Operation Dashboard
   render.js — komponen render yang dipakai lintas halaman: navigasi, kartu
   KPI, peta pelabuhan SVG, panel cuaca, peringatan, timeline, toast, jam,
   dan unduhan CSV.

   Bergantung pada: utils.js, data.js
   Mengekspor: PODB.render
   ========================================================================= */
(function(PODB){
'use strict';

const {$, $$, renderList, nf, esc, icon, PALETTE, statusColor} = PODB.utils;
const D = PODB.data;

/* =========================================================================
   NAVIGASI
   ========================================================================= */
function renderNav(){
  $('#sidebar').innerHTML = D.NAV.map(group => `
    <div class="nav-group-label">${group.group}</div>
    ${group.items.map(item => `
      <button type="button" class="nav-item" data-page="${item.id}"
        ${item.id === 'dashboard' ? 'aria-current="page"' : ''}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${item.svg}</svg>${item.label}
      </button>`).join('')}
  `).join('');
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
function renderWeather(port){
  const w = port.weather;
  const rows = [
    ['Kondisi', w.cond], ['Angin', w.wind], ['Jarak Pandang', w.vis],
    ['Tinggi Gelombang', w.wave], ['Wilayah Perairan', w.area],
    ['Pasang Tertinggi', w.high], ['Surut Terendah', w.low], ['Tinggi Muka Air', w.level]
  ];
  renderList($('#weatherRows'), rows, r => `<div class="tide-row"><span>${r[0]}</span><b>${esc(r[1])}</b></div>`);
  $('#weatherNote').textContent =
    'Format mengikuti prakiraan cuaca maritim BMKG dan data pasang surut Pushidrosal — nilai simulasi.';
  $('#weatherChipText').innerHTML = `<b>${esc(w.cond.split(', ')[1] || '')}</b> ${esc(w.wind)}`;
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
PODB.render = {
  renderNav, kpiCard,
  renderPortMap, renderWeather, renderAlerts,
  buildAxis, buildTimeline,
  showToast, tickClock, downloadCSV
};

})(window.PODB = window.PODB || {});
