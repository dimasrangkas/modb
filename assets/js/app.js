/* =========================================================================
   PMS · Port Management System
   app.js — bootstrap aplikasi multi-halaman.

   Setiap berkas HTML memuat rangkaian skrip yang sama. Yang membedakan hanya
   atribut data-page pada <body>: nilainya menentukan builder mana yang
   dijalankan dan item sidebar mana yang ditandai aktif. Berkas HTML yang
   tidak dikenali tetap mendapat kerangka (topbar, sidebar, copilot) tanpa
   error.

   Bergantung pada: utils.js, data.js, render.js, pages.js, copilot.js
   Dimuat TERAKHIR.
   ========================================================================= */
(function(PMS){
'use strict';

const {$, $$, renderList, on, store, queryParam} = PMS.utils;
const D = PMS.data;
const R = PMS.render;
const P = PMS.pages;
const C = PMS.copilot;

const PAGE = document.body.dataset.page || '';

/* =========================================================================
   PELABUHAN AKTIF

   Pilihan pelabuhan disimpan agar tidak ikut ter-reset setiap kali pindah
   halaman. Bila penyimpanan tidak tersedia (mis. file:// pada sebagian
   browser), utils.store otomatis jatuh ke memori.
   ========================================================================= */
const PORT_KEY = 'pms.port';

function currentPort(){
  return D.PORTS.find(p => p.id === store.get(PORT_KEY)) || D.PORTS[0];
}

function applyPortContext(port){
  store.set(PORT_KEY, port.id);

  const sub = $('#portSub');
  if(sub) sub.textContent = `${port.name} · ${port.city} · ${port.operator} · ${port.coord}`;

  const mapTitle = $('#mapTitle');
  if(mapTitle) mapTitle.textContent = `Peta Pelabuhan ${port.name} — GIS View`;

  R.renderWeather(port);
}

/* =========================================================================
   BUILDER PER HALAMAN
   Kunci objek ini harus sama dengan data-page pada <body>.
   ========================================================================= */
const BUILDERS = {
  dashboard:     () => P.buildDashboard(currentPort()),
  vesselboard:   () => P.buildVesselBoard(),
  resources:     () => P.buildResources(),
  analytics:     () => P.buildAnalytics(),
  executive:     () => P.buildExecutive(),
  messages:      () => P.buildMessages(),
  reports:       () => P.buildReports(),
  shippinglines: () => P.buildShippingLines(),
  vessels:       () => P.buildVesselRegistry(),
  ports:         () => P.buildPorts()
};

/* =========================================================================
   EVENT KERANGKA — ada di semua halaman
   ========================================================================= */
function wireShellEvents(){
  /* Pemilih pelabuhan */
  on('#portSelect', 'change', e => {
    const port = D.PORTS.find(p => p.id === e.target.value);
    applyPortContext(port);
    R.showToast(PAGE === 'dashboard'
      ? `Konteks pelabuhan: ${port.name} — detail operasional tetap menampilkan Tanjung Priok`
      : `Konteks pelabuhan disimpan: ${port.name}`);
  });

  /* Pencarian global: Enter membuka Vessel Board dengan kata kunci terbawa */
  on('#globalSearch', 'keydown', e => {
    if(e.key !== 'Enter') return;
    const term = e.target.value.trim();
    if(!term) return;
    window.location.href = 'vessel-board.html?q=' + encodeURIComponent(term);
  });

  /* Copilot */
  on('#aiFab', 'click',   () => $('#aiSlide').classList.add('open'));
  on('#aiClose', 'click', () => $('#aiSlide').classList.remove('open'));
  on('#aiQuick', 'click', e => {
    const btn = e.target.closest('button');
    if(btn) C.ask(btn.textContent);
  });
  on('#aiSend', 'click', C.submitInput);
  on('#aiInput', 'keydown', e => { if(e.key === 'Enter') C.submitInput(); });
}

/* =========================================================================
   EVENT KHUSUS HALAMAN
   Semua memakai helper on() sehingga aman dipanggil di halaman yang tidak
   memiliki kontrol bersangkutan.
   ========================================================================= */
function setPressed(container, attr, value){
  if(!container) return;
  $$('button', container).forEach(btn =>
    btn.setAttribute('aria-pressed', String(btn.dataset[attr] === value)));
}

function wirePageEvents(){
  /* ---- Dashboard: layer peta ---- */
  on('#layerToggles', 'click', e => {
    const btn = e.target.closest('button');
    if(!btn) return;
    const active = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', String(active));
    const layer = $('#layer' + btn.dataset.layer);
    if(layer) layer.style.display = active ? '' : 'none';
  });

  /* ---- Vessel Board ---- */
  on('#vbFilters', 'click', e => {
    const btn = e.target.closest('button');
    if(!btn) return;
    P.vbState.filter = btn.dataset.filter;
    setPressed($('#vbFilters'), 'filter', P.vbState.filter);
    P.renderVesselBoard();
  });

  on('#vbSearch', 'input', e => {
    P.vbState.search = e.target.value;
    P.renderVesselBoard();
  });

  on('#vbView', 'click', e => {
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

  /* ---- Messages ---- */
  on('#msgTabs', 'click', e => {
    const btn = e.target.closest('button');
    if(!btn) return;
    setPressed($('#msgTabs'), 'tab', btn.dataset.tab);
    P.renderMessages(btn.dataset.tab);
  });

  /* ---- Reports ---- */
  on('#reportGrid', 'click', e => {
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
}

/* =========================================================================
   INIT
   ========================================================================= */
function init(){
  if(typeof Chart !== 'undefined'){
    Chart.defaults.font.family = "'Plus Jakarta Sans', system-ui, sans-serif";
    Chart.defaults.color = '#6B7280';
  }

  /* 1. Kerangka yang sama di semua halaman */
  R.renderTopbar();
  R.renderNav(PAGE);
  R.renderOverlays();
  R.renderCredits();

  const port = currentPort();
  $('#portSelect').innerHTML = D.PORTS
    .map(p => `<option value="${p.id}"${p.id === port.id ? ' selected' : ''}>${p.name}</option>`)
    .join('');

  renderList($('#aiQuick'), D.QUICK_ACTIONS, q => `<button type="button">${q}</button>`);
  C.greet();

  /* 2. Isi khas halaman ini */
  const build = BUILDERS[PAGE];
  if(build) build();

  applyPortContext(port);

  /* Grafik dibuat setelah isi halaman ada; canvas sudah terlihat di MPA
     sehingga Chart.js langsung mendapat ukuran yang benar. */
  P.initCharts(PAGE);

  /* Kata kunci dari pencarian global halaman lain */
  if(PAGE === 'vesselboard'){
    const term = queryParam('q');
    if(term){
      P.vbState.search = term;
      $('#vbSearch').value = term;
      P.renderVesselBoard();
      R.showToast(`Menampilkan hasil pencarian untuk "${term}"`);
    }
  }

  /* 3. Event */
  wireShellEvents();
  wirePageEvents();

  R.tickClock();
  setInterval(R.tickClock, 1000);
}

init();

})(window.PMS = window.PMS || {});
