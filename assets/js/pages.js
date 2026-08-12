/* =========================================================================
   PMS · Port Management System
   pages.js — perakitan isi tiap halaman, termasuk konfigurasi grafik.

   Grafik TIDAK dibuat saat muat halaman: canvas di dalam elemen `hidden`
   berukuran nol sehingga Chart.js akan salah menghitung skala. Chart baru
   dibuat lewat initCharts() ketika halamannya benar-benar dibuka.

   Bergantung pada: utils.js, data.js, render.js, Chart.js
   Mengekspor: PMS.pages
   ========================================================================= */
(function(PMS){
'use strict';

const {$, renderList, nf, esc, badge, seededRandom, PALETTE} = PMS.utils;
const R = PMS.render;
const D = PMS.data;

/* =========================================================================
   DASHBOARD
   ========================================================================= */
function dashboardKpis(){
  return [
    {icon:'arrival',   label:'Kunjungan Kapal (Hari Ini)',  value:nf(D.DAILY.shipCalls),      unit:'call',    delta:D.DAILY.shipCallsDelta,  up:D.DAILY.shipCallsUp},
    {icon:'departure', label:'Keberangkatan (Hari Ini)',    value:nf(D.DAILY.departures),     unit:'call',    delta:D.DAILY.departuresDelta, up:D.DAILY.departuresUp},
    {icon:'volume',    label:'Arus Peti Kemas',             value:nf(D.DAILY.teu),            unit:'TEU',     delta:D.DAILY.teuDelta,        up:D.DAILY.teuUp},
    {icon:'cargo',     label:'Arus Barang',                 value:nf(D.DAILY.tons),           unit:'ton',     delta:D.DAILY.tonsDelta,       up:D.DAILY.tonsUp},
    {icon:'berth',     label:'Dermaga Terpakai',            value:`${D.DERIVED.berthsOccupied} / ${D.DERIVED.berthsTotal}`,
     unit:'dermaga', delta:`BOR ${nf(D.DERIVED.bor, 1)}%`, up:true},
    {icon:'yard',      label:'Yard Occupancy Ratio (YOR)',  value:nf(D.DAILY.yor, 1),         unit:'%',       delta:D.DAILY.yorDelta,        up:D.DAILY.yorUp},
    {icon:'crane',     label:'Box per Ship per Hour (BSH)', value:nf(D.DAILY.bsh, 1),         unit:'box/jam', delta:D.DAILY.bshDelta,        up:D.DAILY.bshUp},
    {icon:'clock',     label:'Waiting Time Rata-rata',      value:nf(D.DAILY.waitingTime, 1), unit:'jam',     delta:D.DAILY.waitingDelta,    up:D.DAILY.waitingUp}
  ];
}

function buildDashboard(port){
  renderList($('#kpiGrid'), dashboardKpis(), R.kpiCard);
  R.renderPortMap();
  R.renderWeather(port);
  R.renderAlerts();

  R.buildAxis($('#tlAxis'));
  R.buildTimeline($('#tlBody'), D.VESSELS.filter(v => v.status !== 'Departed').slice(0, 9));

  renderList($('#scheduleList'), D.SCHEDULE, s => `
    <div class="sched-item">
      <div class="sched-time">${s.t}</div>
      <div class="sched-dot" style="background:${s.col}"></div>
      <div class="sched-body"><b>${esc(s.label)}</b><span>${esc(s.sub)}</span></div>
    </div>`);

  renderList($('#cargoSummary'), D.CARGO, c => {
    const pct = Math.round(c.val / c.max * 100);
    return `<div class="cargo-bar-row">
      <div class="lbl"><span>${c.label}</span><b>${nf(c.val)}</b></div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${c.col}"></div></div>
    </div>`;
  });

  const avail = [
    {n:`${D.DERIVED.berthsTotal - D.DERIVED.berthsOccupied}/${D.DERIVED.berthsTotal}`, l:'Dermaga Tersedia'},
    {n:`${D.DERIVED.cranesReady}/${D.DERIVED.cranesTotal}`, l:'Container Crane Siap'},
    {n:`${D.DERIVED.tugsReady}/${D.DERIVED.tugsTotal}`,     l:'Kapal Tunda Siap'},
    {n:`${D.DERIVED.pilotsReady}/${D.DERIVED.pilotsTotal}`, l:'Kapal Pandu Siap'}
  ];
  renderList($('#resAvail'), avail, r =>
    `<div class="resource-mini"><div class="n">${r.n}</div><div class="l">${r.l}</div></div>`);
}

/* =========================================================================
   VESSEL BOARD
   ========================================================================= */
const VB_FILTERS = [
  {id:'all',      label:'Semua'},
  {id:'Arriving', label:'Kedatangan'},
  {id:'Berthed',  label:'Sandar'},
  {id:'Working',  label:'Bongkar / Muat'},
  {id:'Departed', label:'Berangkat'},
  {id:'Delayed',  label:'Tertunda'}
];

const vbState = {filter:'all', search:''};

function matchesFilter(v, filter){
  if(filter === 'all') return true;
  if(filter === 'Working') return v.status === 'Loading' || v.status === 'Discharging';
  return v.status === filter;
}

function renderVesselBoard(){
  const term = vbState.search.trim().toLowerCase();
  const rows = D.VESSELS.filter(v =>
    matchesFilter(v, vbState.filter) &&
    (!term || v.name.toLowerCase().includes(term) || v.imo.includes(term) || v.voyage.toLowerCase().includes(term))
  );

  const body = $('#vbBody');
  if(!rows.length){
    body.innerHTML = '<tr class="empty-row"><td colspan="16">Tidak ada kapal yang cocok dengan filter atau kata kunci pencarian.</td></tr>';
    return;
  }

  renderList(body, rows, v => `
    <tr>
      <td class="name">${esc(v.name)}</td><td>${esc(v.voyage)}</td><td>${esc(D.lineShort(v.line))}</td><td>${esc(v.imo)}</td>
      <td>${esc(v.origin)}</td><td>${esc(v.destination)}</td>
      <td>${esc(v.eta)}</td><td>${esc(v.etd)}</td><td>${esc(v.ata)}</td><td>${esc(v.atd)}</td>
      <td>${esc(v.berth)}</td><td>${esc(v.pilot)}</td><td>${esc(v.tug)}</td>
      <td>${badge(v.cargo)}</td><td>${badge(v.customs)}</td><td>${badge(v.status)}</td>
    </tr>`);
}

function buildVesselBoard(){
  renderList($('#vbFilters'), VB_FILTERS, f =>
    `<button type="button" class="chip" data-filter="${f.id}" aria-pressed="${f.id === 'all'}">${f.label}</button>`);
  renderVesselBoard();
}

/* =========================================================================
   RESOURCES
   ========================================================================= */
function buildResources(){
  renderList($('#berthGrid'), D.BERTH_STATE, b => `
    <div class="berth-cell" style="border-top:3px solid ${b.color}">
      <div class="bn">${b.code}</div>
      <div class="bterm" title="${esc(b.terminal)}">${esc(b.terminal)}</div>
      <div class="bstatus" style="color:${b.color}">${b.status}</div>
      <div class="bvessel">${b.vessel ? esc(b.vessel.name) : esc(b.maintenance || '—')}</div>
    </div>`);

  renderList($('#craneList'), D.CRANES, c => {
    const color = c.util === 0 ? PALETTE.warning : c.util > 85 ? PALETTE.accent : PALETTE.primary;
    return `<div class="res-row">
      <div class="rn">${c.name}<small>${c.terminal}</small></div>
      <div class="rtrack"><div class="bar-track"><div class="bar-fill" style="width:${c.util}%;background:${color}"></div></div></div>
      <div class="rval">${c.note ? c.note : nf(c.util) + '%'}</div>
    </div>`;
  });

  renderList($('#tugList'), D.TUGS, t => {
    const color = t.status === 'Available' ? PALETTE.success : t.status === 'Maintenance' ? PALETTE.warning : PALETTE.primary;
    const width = t.status === 'Available' ? 20 : t.status === 'Maintenance' ? 100 : 70;
    return `<div class="res-row">
      <div class="rn">${t.name}<small>${esc(t.assign)}</small></div>
      <div class="rtrack"><div class="bar-track"><div class="bar-fill" style="width:${width}%;background:${color}"></div></div></div>
      <div class="rval" style="color:${color}">${t.status}</div>
    </div>`;
  });

  renderList($('#warehouseList'), D.WAREHOUSES, w => `
    <div class="res-row">
      <div class="rn" style="width:180px;">${esc(w.name)}</div>
      <div class="rtrack"><div class="bar-track"><div class="bar-fill" style="width:${w.pct}%;background:${w.pct > 85 ? PALETTE.warning : PALETTE.accent}"></div></div></div>
      <div class="rval">${w.pct}%</div>
    </div>`);

  /* lapangan penumpukan */
  const yardPct = D.DAILY.yardUsed / D.DAILY.yardCapacity * 100;
  $('#yardStat').innerHTML = `${nf(D.DAILY.yardUsed)} <small>/ ${nf(D.DAILY.yardCapacity)} TEU</small>`;
  $('#yardBar').style.width = yardPct.toFixed(1) + '%';
  $('#yardNote').textContent = `Terisi ${nf(yardPct, 1)}% — YOR harian ${nf(D.DAILY.yor, 1)}%.`;

  const rnd = seededRandom(20260807);
  const cells = 60;
  const filled = Math.round(cells * yardPct / 100);
  renderList($('#yardGrid'), Array.from({length:cells}, (_, i) => i), i => {
    const bg = i < filled ? (rnd() > 0.85 ? PALETTE.warning : PALETTE.primary) : '#E5EEF5';
    return `<div class="yard-cell" style="background:${bg}"></div>`;
  });

  /* terminal penumpang */
  const paxPct = D.DAILY.passengers / D.DAILY.passengerCapacity * 100;
  $('#paxStat').innerHTML = `${nf(D.DAILY.passengers)} <small>/ ${nf(D.DAILY.passengerCapacity)} pax kapasitas</small>`;
  $('#paxBar').style.width = paxPct.toFixed(1) + '%';

  renderList($('#equipmentList'), D.EQUIPMENT, e => {
    const color = e.status === 'Operational' ? PALETTE.success : PALETTE.warning;
    return `<div class="res-row">
      <div class="rn" style="width:180px;">${esc(e.name)}</div>
      <div class="rtrack"></div>
      <div class="rval" style="color:${color}">${e.status}</div>
    </div>`;
  });
}

/* =========================================================================
   ANALYTICS
   ========================================================================= */
const CHART_CONFIGS = [
  {title:'Lalu Lintas Kapal', sub:'Kedatangan & keberangkatan per jam, 24 jam terakhir', type:'line', labels:D.HOURS_24, datasets:[
    {label:'Kedatangan',    data:D.SERIES.arrivals,   borderColor:PALETTE.primary, backgroundColor:'rgba(0,119,182,0.1)', fill:true, tension:.4, pointRadius:0, borderWidth:2},
    {label:'Keberangkatan', data:D.SERIES.departures, borderColor:PALETTE.accent,  backgroundColor:'transparent',         tension:.4, pointRadius:0, borderWidth:2}
  ]},

  {title:'Arus Barang', sub:'Ton per kategori muatan, 7 hari terakhir', type:'bar', labels:D.DAYS_ID, stacked:true, datasets:[
    {label:'Peti Kemas',   data:D.SERIES.cargoContainer, backgroundColor:PALETTE.primary},
    {label:'Curah Kering', data:D.SERIES.cargoDryBulk,   backgroundColor:PALETTE.accent},
    {label:'Curah Cair',   data:D.SERIES.cargoLiquid,    backgroundColor:PALETTE.success}
  ]},

  {title:'Utilisasi Dermaga', sub:'Persentase jam terpakai per dermaga, hari ini', type:'bar', horizontal:true,
   labels:D.BERTHS.map(b => b.code), datasets:[
    {label:'Utilisasi %', data:D.SERIES.berthUtil, backgroundColor:PALETTE.secondary}
  ]},

  {title:'Tren Keterlambatan', sub:'Rata-rata keterlambatan kapal (menit), 14 hari', type:'line', labels:D.DAYS_14, datasets:[
    {label:'Rata-rata keterlambatan', data:D.SERIES.delay, borderColor:PALETTE.danger, backgroundColor:'rgba(231,111,81,0.08)', fill:true, tension:.4, pointRadius:0, borderWidth:2}
  ]},

  {title:'Analisis Jam Puncak', sub:'Jumlah operasi kapal menurut jam', type:'bar', labels:D.HOURS_24, datasets:[
    {label:'Operasi', data:D.SERIES.peakHour, backgroundColor:PALETTE.accent}
  ]},

  {title:'Waiting Time', sub:'Jam menunggu di area labuh sebelum sandar, 14 hari', type:'line', labels:D.DAYS_14, datasets:[
    {label:'Waiting time (jam)', data:D.SERIES.waiting, borderColor:PALETTE.success, backgroundColor:'transparent', tension:.4, pointRadius:0, borderWidth:2}
  ]},

  {title:'Efisiensi Sumber Daya', sub:'Indeks utilisasi menurut kelas sumber daya', type:'radar',
   labels:['Dermaga','Container Crane','Kapal Tunda','Pemanduan','Gudang','Lapangan'], datasets:[
    {label:'Efisiensi', data:D.SERIES.radar, backgroundColor:'rgba(0,180,216,0.15)', borderColor:PALETTE.accent, pointBackgroundColor:PALETTE.accent}
  ]}
];

function chartOptions(cfg){
  return {
    responsive:true,
    maintainAspectRatio:true,
    indexAxis: cfg.horizontal ? 'y' : 'x',
    plugins:{legend:{display:cfg.datasets.length > 1, position:'bottom', labels:{boxWidth:10, font:{size:10.5}}}},
    scales: cfg.type === 'radar'
      ? {r:{grid:{color:'#E5EEF5'}, angleLines:{color:'#E5EEF5'}, pointLabels:{font:{size:10.5}}, ticks:{display:false}}}
      : {
          x:{stacked:!!cfg.stacked, grid:{color:'#F1F5F8'}, ticks:{font:{size:9.5}, color:'#9AA6B2', maxTicksLimit:12}},
          y:{stacked:!!cfg.stacked, grid:{color:'#F1F5F8'}, ticks:{font:{size:9.5}, color:'#9AA6B2'}}
        }
  };
}

function buildAnalytics(){
  renderList($('#aiInsights'), D.AI_INSIGHTS, a =>
    `<div class="ai-insight"><div class="aidot"></div><div><b>${esc(a.title)}</b><span>${esc(a.body)}</span></div></div>`);

  renderList($('#analyticsGrid'), CHART_CONFIGS, (cfg, i) => `
    <div class="card chart-card">
      <h3>${cfg.title}</h3><div class="sub">${cfg.sub}</div>
      <canvas id="chart${i}" height="${cfg.type === 'radar' ? 200 : 95}"></canvas>
    </div>`);

  /* Heatmap okupansi — tekstur deterministik per dermaga & jam. */
  $('#heatHours').innerHTML = '<span></span>' + D.HOURS_24.map(h => `<span>${h}</span>`).join('');
  const rnd = seededRandom(20260101);
  renderList($('#heatBody'), D.BERTHS, b => {
    const cells = D.HOURS_24.map(h => {
      const val = Math.max(.05, Math.min(1, .3 + Math.sin((h - 8) / 12 * Math.PI) * .5 + (rnd() - .5) * .15));
      const r  = Math.round(241 + (0   - 241) * val);
      const g  = Math.round(245 + (119 - 245) * val);
      const bl = Math.round(248 + (182 - 248) * val);
      return `<div class="heat-cell" style="background:rgb(${r},${g},${bl})" title="${b.code} pukul ${String(h).padStart(2, '0')}:00"></div>`;
    }).join('');
    return `<div class="heat-row"><div class="lbl">${b.code}</div>${cells}</div>`;
  });
}

function initAnalyticsCharts(){
  CHART_CONFIGS.forEach((cfg, i) => {
    new Chart($('#chart' + i), {
      type:cfg.type,
      data:{labels:cfg.labels, datasets:cfg.datasets},
      options:chartOptions(cfg)
    });
  });
}

/* =========================================================================
   EXECUTIVE
   ========================================================================= */
function buildExecutive(){
  $('#execSub').textContent = D.EXEC.period;
  renderList($('#execKpiGrid'), D.EXEC.kpis, R.kpiCard);
  $('#execSummary').innerHTML = D.EXEC.summary.map(p => `<p>${p}</p>`).join('');
}

function initExecutiveChart(){
  new Chart($('#execChart'), {
    data:{labels:D.MONTHS_12, datasets:[
      {type:'bar',  label:'Indeks Pendapatan',      data:D.SERIES.revenueIdx, backgroundColor:PALETTE.accent, order:2},
      {type:'line', label:'Indeks Kunjungan Kapal', data:D.SERIES.callIdx,    borderColor:PALETTE.secondary,
       backgroundColor:'transparent', tension:.4, pointRadius:3, pointBackgroundColor:PALETTE.secondary, borderWidth:2, order:1}
    ]},
    options:{
      responsive:true,
      plugins:{legend:{position:'bottom', labels:{boxWidth:10, font:{size:11}}}},
      scales:{
        x:{grid:{display:false},      ticks:{font:{size:10.5}, color:'#9AA6B2'}},
        y:{grid:{color:'#F1F5F8'},    ticks:{font:{size:10.5}, color:'#9AA6B2'}}
      }
    }
  });
}

/* Inisialisasi grafik yang ditunda sampai halamannya dibuka. */
const chartsReady = new Set();
function initCharts(pageId){
  if(chartsReady.has(pageId) || typeof Chart === 'undefined') return;
  if(pageId === 'analytics')      initAnalyticsCharts();
  else if(pageId === 'executive') initExecutiveChart();
  else return;
  chartsReady.add(pageId);
}

/* =========================================================================
   MESSAGES
   ========================================================================= */
const PARSE_BADGE = {ok:['g', 'Parsed OK'], warn:['y', 'Parsed Warn']};
const VALID_BADGE = {valid:['g', 'Valid'], review:['y', 'Perlu Tinjau'], invalid:['r', 'Tidak Valid']};

function renderMessages(tab){
  const rows = D.MESSAGES.filter(m => tab === 'all' || m.src === tab);
  renderList($('#msgList'), rows, m => {
    const [pc, pl] = PARSE_BADGE[m.parse];
    const [vc, vl] = VALID_BADGE[m.valid];
    return `<div class="msg-item">
      <div class="msg-source">${D.MSG_LABEL[m.src] || m.src}</div>
      <div class="msg-body"><b>${esc(m.title)}</b><span>${esc(m.meta)}</span></div>
      <div><span class="badge ${pc}"><i></i>${pl}</span></div>
      <div><span class="badge ${vc}"><i></i>${vl}</span></div>
      <div class="msg-time">${m.t}</div>
    </div>`;
  });
}

function buildMessages(){
  renderList($('#msgTabs'), D.MSG_SOURCES, s =>
    `<button type="button" class="chip" data-tab="${s.id}" aria-pressed="${s.id === 'all'}">${s.label}</button>`);
  renderMessages('all');
}

/* =========================================================================
   REPORTS
   ========================================================================= */
function buildReports(){
  renderList($('#reportGrid'), D.REPORTS, (r, i) => `
    <div class="card report-card" data-report="${i}">
      <div class="ric">${PMS.utils.icon(r.icon)}</div>
      <h3>${r.title}</h3><p>${r.desc}</p>
      <div class="export-row">
        <button type="button" class="export-btn" data-format="PDF">PDF</button>
        <button type="button" class="export-btn" data-format="Excel">Excel</button>
        <button type="button" class="export-btn" data-format="CSV">CSV</button>
      </div>
    </div>`);
}

/* =========================================================================
   DIREKTORI — masing-masing kini menempati halaman sendiri
   ========================================================================= */
function buildShippingLines(){
  renderList($('#shippingLinesGrid'), D.LINES, l => {
    const active = D.VESSELS.filter(v => v.line === l.code && v.status !== 'Departed').length;
    return `<div class="card dir-card">
      <div class="dir-top">
        <div class="dir-logo">${l.code.slice(0, 3)}</div>
        <div><b>${esc(l.name)}</b><span>${esc(l.segment)}</span></div>
      </div>
      <div class="dir-stats">
        <div>Kapal Aktif<b>${active}</b></div>
        <div>Voyage Aktif<b>${D.VESSELS.filter(v => v.line === l.code).length}</b></div>
        <div>Ketepatan Waktu<b>${nf(l.onTime, 1)}%</b></div>
        <div>Port Call (30 hari)<b>${l.calls}</b></div>
      </div>
    </div>`;
  });
}

function buildVesselRegistry(){
  renderList($('#vesselsRegistryBody'), D.VESSELS, v => `
    <tr>
      <td class="name">${esc(v.name)}</td><td>${esc(v.imo)}</td><td>${esc(v.type)}</td><td>${esc(v.flag)}</td>
      <td>${nf(v.gt)}</td><td>${nf(v.loa)}</td><td>${esc(D.lineName(v.line))}</td><td>${badge(v.status)}</td>
    </tr>`);
}

function buildPorts(){
  renderList($('#portsGrid'), D.PORTS, p => `
    <div class="card dir-card">
      <div class="dir-top">
        <div class="dir-logo">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" stroke-width="2" aria-hidden="true">
            <path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z"/>
          </svg>
        </div>
        <div><b>${esc(p.name)}</b><span>${esc(p.city)} · ${esc(p.operator)}</span></div>
      </div>
      <div class="dir-stats">
        <div>Dermaga<b>${p.berths}</b></div>
        <div>Kapal Saat Ini<b>${p.vessels}</b></div>
        <div>BOR<b>${p.util}%</b></div>
        <div>Status<b style="color:var(--success)">Operasional</b></div>
      </div>
    </div>`);
}

/* =========================================================================
   EKSPOR
   ========================================================================= */
PMS.pages = {
  buildDashboard,
  buildVesselBoard, renderVesselBoard, vbState,
  buildResources,
  buildAnalytics, buildExecutive, initCharts,
  buildMessages, renderMessages,
  buildReports,
  buildShippingLines, buildVesselRegistry, buildPorts
};

})(window.PMS = window.PMS || {});
