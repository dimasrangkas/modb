/* =========================================================================
   PMS · Port Management System
   app.js — router antar halaman, pemasangan seluruh event listener, dan
   titik masuk aplikasi.

   Bergantung pada: utils.js, data.js, render.js, pages.js, copilot.js
   Dimuat TERAKHIR.
   ========================================================================= */
(function(PMS){
'use strict';

const {$, $$, renderList, nf} = PMS.utils;
const D = PMS.data;
const R = PMS.render;
const P = PMS.pages;
const C = PMS.copilot;

/* =========================================================================
   ROUTER
   ========================================================================= */
function goToPage(pageId){
  $$('.nav-item').forEach(btn => {
    if(btn.dataset.page === pageId) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  });

  $$('.page').forEach(page => { page.hidden = page.id !== 'page-' + pageId; });

  // Grafik dibuat setelah halaman terlihat agar canvas punya ukuran nyata.
  P.initCharts(pageId);
  window.scrollTo({top:0, behavior:'smooth'});
}

/** Set aria-pressed pada satu grup tombol berdasarkan data-<attr>. */
function setPressed(container, attr, value){
  $$('button', container).forEach(btn =>
    btn.setAttribute('aria-pressed', String(btn.dataset[attr] === value)));
}

/* =========================================================================
   KONTEKS PELABUHAN AKTIF
   ========================================================================= */
function applyPortContext(port){
  $('#portSub').textContent  = `${port.name} · ${port.city} · ${port.operator} · ${port.coord}`;
  $('#mapTitle').textContent = `Peta Pelabuhan ${port.name} — GIS View`;
  R.renderWeather(port);
}

/* =========================================================================
   EVENT
   ========================================================================= */
function wireEvents(){
  /* ---- navigasi ---- */
  $('#sidebar').addEventListener('click', e => {
    const btn = e.target.closest('.nav-item');
    if(btn) goToPage(btn.dataset.page);
  });

  /* ---- pemilih pelabuhan ---- */
  $('#portSelect').addEventListener('change', e => {
    const port = D.PORTS.find(p => p.id === e.target.value);
    applyPortContext(port);
    R.showToast(`Konteks pelabuhan: ${port.name} — detail operasional tetap menampilkan Tanjung Priok`);
  });

  /* ---- pencarian global: Enter melompat ke Vessel Board ---- */
  $('#globalSearch').addEventListener('keydown', e => {
    if(e.key !== 'Enter') return;
    const term = e.target.value.trim();
    if(!term) return;

    P.vbState.search = term;
    P.vbState.filter = 'all';
    $('#vbSearch').value = term;
    setPressed($('#vbFilters'), 'filter', 'all');
    P.renderVesselBoard();

    goToPage('vesselboard');
    R.showToast(`Menampilkan hasil pencarian untuk "${term}"`);
  });

  $('#notifBtn').addEventListener('click', () => {
    goToPage('messages');
    R.showToast(`${D.ALERTS.length} peringatan operasional aktif`);
  });

  /* ---- layer peta ---- */
  $('#layerToggles').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if(!btn) return;
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', String(on));
    const layer = $('#layer' + btn.dataset.layer);
    if(layer) layer.style.display = on ? '' : 'none';
  });

  /* ---- vessel board ---- */
  $('#vbFilters').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if(!btn) return;
    P.vbState.filter = btn.dataset.filter;
    setPressed($('#vbFilters'), 'filter', P.vbState.filter);
    P.renderVesselBoard();
  });

  $('#vbSearch').addEventListener('input', e => {
    P.vbState.search = e.target.value;
    P.renderVesselBoard();
  });

  $('#vbView').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if(!btn) return;
    const timeline = btn.dataset.view === 'timeline';
    setPressed($('#vbView'), 'view', btn.dataset.view);
    $('#vbTableWrap').hidden    = timeline;
    $('#vbTimelineWrap').hidden = !timeline;
    if(timeline){
      R.buildAxis($('#vbTlAxis'));
      R.buildTimeline($('#vbTlBody'), D.VESSELS);
    }
  });

  /* ---- pesan ---- */
  $('#msgTabs').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if(!btn) return;
    setPressed($('#msgTabs'), 'tab', btn.dataset.tab);
    P.renderMessages(btn.dataset.tab);
  });

  /* ---- laporan ---- */
  $('#reportGrid').addEventListener('click', e => {
    const btn = e.target.closest('.export-btn');
    if(!btn) return;

    const report = D.REPORTS[Number(btn.closest('.report-card').dataset.report)];
    if(btn.dataset.format === 'CSV' && report.exportable){
      const rows = [['Kapal','Voyage','Operator','IMO','Asal','Tujuan','ETA','ETD','Dermaga','Status']];
      D.VESSELS.forEach(v => rows.push([
        v.name, v.voyage, D.lineName(v.line), v.imo, v.origin, v.destination, v.eta, v.etd, v.berth, v.status
      ]));
      R.downloadCSV(report.title.replace(/\s+/g, '_') + '.csv', rows);
      R.showToast(`${report.title} diekspor sebagai CSV`);
    }else{
      R.showToast(`Menyiapkan ${report.title} dalam format ${btn.dataset.format}…`);
    }
  });

  /* ---- copilot ---- */
  $('#aiFab').addEventListener('click',   () => $('#aiSlide').classList.add('open'));
  $('#aiClose').addEventListener('click', () => $('#aiSlide').classList.remove('open'));
  $('#aiQuick').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if(btn) C.ask(btn.textContent);
  });
  $('#aiSend').addEventListener('click', C.submitInput);
  $('#aiInput').addEventListener('keydown', e => { if(e.key === 'Enter') C.submitInput(); });
}

/* =========================================================================
   INIT
   ========================================================================= */
function init(){
  if(typeof Chart !== 'undefined'){
    Chart.defaults.font.family = "'Plus Jakarta Sans', system-ui, sans-serif";
    Chart.defaults.color = '#6B7280';
  }

  R.renderNav();

  $('#portSelect').innerHTML = D.PORTS.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  applyPortContext(D.PORTS[0]);

  P.buildDashboard(D.PORTS[0]);
  P.buildVesselBoard();
  P.buildResources();
  P.buildAnalytics();
  P.buildExecutive();
  P.buildMessages();
  P.buildReports();
  P.buildDirectories();

  renderList($('#aiQuick'), D.QUICK_ACTIONS, q => `<button type="button">${q}</button>`);
  C.greet();

  wireEvents();
  R.tickClock();
  setInterval(R.tickClock, 1000);
}

init();

})(window.PMS = window.PMS || {});
