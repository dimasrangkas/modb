/* =========================================================================
   PMS · Port Management System
   data.js — SATU-SATUNYA sumber data aplikasi.

   Nama pelabuhan, terminal, dermaga, perusahaan pelayaran, kapal dan instansi
   memakai entitas nyata Indonesia. SELURUH ANGKA bersifat simulasi untuk
   keperluan demonstrasi — termasuk nomor IMO, tarif dan volume.

   Bergantung pada: utils.js
   Mengekspor: PMS.data
   ========================================================================= */
(function(PMS){
'use strict';

const {PALETTE, toHours} = PMS.utils;

/* =========================================================================
   1. NAVIGASI
   ========================================================================= */
const NAV = [
  {group:'Operasional', items:[
    {id:'dashboard',   label:'Dashboard',     svg:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>'},
    {id:'vesselboard', label:'Vessel Board',  svg:'<path d="M3 17l2-7h14l2 7"/><path d="M5 17v2h14v-2M7 10V6h10v4"/>'},
    {id:'resources',   label:'Resources',     svg:'<path d="M3 7l9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>'},
    {id:'analytics',   label:'Analytics',     svg:'<path d="M3 3v18h18"/><path d="M7 15l4-6 3 3 5-8"/>'},
    {id:'executive',   label:'Executive',     svg:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/>'}
  ]},
  {group:'Komunikasi', items:[
    {id:'messages',    label:'Messages',      svg:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 6l9 7 9-7"/>'},
    {id:'reports',     label:'Reports',       svg:'<path d="M6 3h9l5 5v13H6z"/><path d="M9 12h6M9 16h6M9 8h3"/>'}
  ]},
  {group:'Direktori', items:[
    {id:'shippinglines', label:'Perusahaan Pelayaran', svg:'<path d="M4 21c2 1.2 4 1.2 6 0s4-1.2 6 0 4 1.2 6 0"/><path d="M6 17l.8-8h10.4l.8 8"/><path d="M12 9V4h4l-4 3"/>'},
    {id:'vessels',     label:'Registri Kapal',svg:'<path d="M3 17l2-7h14l2 7"/><path d="M7 10V6h10v4"/><path d="M2 21c2 1 4 1 6 0s4-1 6 0 4 1 6 0"/>'},
    {id:'ports',       label:'Pelabuhan',     svg:'<path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>'}
  ]}
];

/* =========================================================================
   2. PELABUHAN — jaringan Pelindo & BP Batam
   ========================================================================= */
const PORTS = [
  {id:'priok', name:'Tanjung Priok', city:'Jakarta Utara, DKI Jakarta', operator:'Pelindo Regional 2',
   berths:12, vessels:9, util:75, coord:'06°06′ LS · 106°53′ BT',
   weather:{cond:'Berawan, 30°C', wind:'Timur Laut 12 kt', vis:'9,5 NM', wave:'0,5 – 1,25 m', area:'Perairan Utara Jakarta',
            high:'04:12 · 14:38', low:'09:47 · 21:03', level:'+1,8 m LWS'}},

  {id:'perak', name:'Tanjung Perak', city:'Surabaya, Jawa Timur', operator:'Pelindo Regional 3',
   berths:10, vessels:7, util:68, coord:'07°12′ LS · 112°44′ BT',
   weather:{cond:'Cerah Berawan, 31°C', wind:'Timur 10 kt', vis:'10 NM', wave:'0,5 – 1,0 m', area:'Selat Madura',
            high:'05:04 · 16:22', low:'10:58 · 22:41', level:'+1,4 m LWS'}},

  {id:'belawan', name:'Belawan', city:'Medan, Sumatera Utara', operator:'Pelindo Regional 1',
   berths:8, vessels:5, util:58, coord:'03°47′ LU · 98°42′ BT',
   weather:{cond:'Hujan Ringan, 28°C', wind:'Barat Laut 14 kt', vis:'6 NM', wave:'1,25 – 2,0 m', area:'Selat Malaka bagian tengah',
            high:'03:35 · 15:10', low:'09:20 · 21:44', level:'+2,1 m LWS'}},

  {id:'emas', name:'Tanjung Emas', city:'Semarang, Jawa Tengah', operator:'Pelindo Regional 3',
   berths:7, vessels:4, util:61, coord:'06°56′ LS · 110°25′ BT',
   weather:{cond:'Berawan, 30°C', wind:'Timur Laut 9 kt', vis:'8 NM', wave:'0,5 – 1,25 m', area:'Perairan Utara Jawa Tengah',
            high:'04:48 · 15:52', low:'10:11 · 22:05', level:'+1,2 m LWS'}},

  {id:'makassar', name:'Makassar (Soekarno–Hatta)', city:'Makassar, Sulawesi Selatan', operator:'Pelindo Regional 4',
   berths:9, vessels:6, util:64, coord:'05°07′ LS · 119°24′ BT',
   weather:{cond:'Cerah, 32°C', wind:'Barat Daya 11 kt', vis:'10 NM', wave:'0,5 – 1,25 m', area:'Selat Makassar bagian selatan',
            high:'06:02 · 17:30', low:'11:45 · 23:18', level:'+1,6 m LWS'}},

  {id:'panjang', name:'Panjang', city:'Bandar Lampung, Lampung', operator:'Pelindo Regional 2',
   berths:6, vessels:4, util:57, coord:'05°28′ LS · 105°19′ BT',
   weather:{cond:'Berawan, 30°C', wind:'Tenggara 13 kt', vis:'8,5 NM', wave:'1,0 – 1,5 m', area:'Teluk Lampung',
            high:'04:26 · 15:04', low:'10:02 · 21:38', level:'+1,3 m LWS'}},

  {id:'batuampar', name:'Batu Ampar', city:'Batam, Kepulauan Riau', operator:'BP Batam',
   berths:7, vessels:6, util:71, coord:'01°10′ LU · 103°58′ BT',
   weather:{cond:'Hujan Ringan, 29°C', wind:'Utara 15 kt', vis:'6,5 NM', wave:'1,25 – 2,0 m', area:'Perairan Batam – Selat Singapura',
            high:'03:58 · 14:50', low:'09:33 · 21:12', level:'+2,4 m LWS'}},

  {id:'bitung', name:'Bitung', city:'Bitung, Sulawesi Utara', operator:'Pelindo Regional 4',
   berths:6, vessels:3, util:52, coord:'01°26′ LU · 125°11′ BT',
   weather:{cond:'Cerah Berawan, 31°C', wind:'Timur 8 kt', vis:'10 NM', wave:'0,5 – 1,25 m', area:'Laut Maluku bagian utara',
            high:'05:41 · 17:06', low:'11:20 · 23:02', level:'+1,1 m LWS'}}
];

/* =========================================================================
   3. PERUSAHAAN PELAYARAN
   ========================================================================= */
const LINES = [
  {code:'PELNI',    short:'PELNI',             name:'PT Pelayaran Nasional Indonesia (PELNI)', segment:'Kapal Penumpang & Tol Laut',  onTime:93.4, calls:26},
  {code:'TEMAS',    short:'Temas Line',        name:'PT Temas Tbk (Temas Line)',               segment:'Peti Kemas Domestik',         onTime:91.2, calls:34},
  {code:'SPIL',     short:'SPIL',              name:'PT Salam Pacific Indonesia Lines',        segment:'Peti Kemas Domestik',         onTime:89.7, calls:41},
  {code:'MERATUS',  short:'Meratus Line',      name:'PT Meratus Line',                         segment:'Peti Kemas & Kargo Domestik', onTime:92.8, calls:38},
  {code:'TANTO',    short:'Tanto Intim Line',  name:'PT Tanto Intim Line',                     segment:'Peti Kemas Domestik',         onTime:90.5, calls:29},
  {code:'SAMUDERA', short:'Samudera Indonesia',name:'PT Samudera Indonesia Tbk',               segment:'Peti Kemas Regional',         onTime:94.1, calls:22},
  {code:'DJL',      short:'Djakarta Lloyd',    name:'PT Djakarta Lloyd (Persero)',             segment:'Kargo Umum & Tol Laut',       onTime:88.3, calls:14},
  {code:'PIS',      short:'Pertamina (PIS)',   name:'PT Pertamina International Shipping',     segment:'Tanker Minyak & Gas',         onTime:95.6, calls:19},
  {code:'BAI',      short:'Bahtera Adhiguna',  name:'PT Bahtera Adhiguna',                     segment:'Curah Kering / Batu Bara',    onTime:87.9, calls:11},
  {code:'ALP',      short:'Atosim Lampung',    name:'PT Atosim Lampung Pelayaran',             segment:'RoRo & Angkutan Kendaraan',   onTime:90.8, calls:16}
];

const lineOf    = code => LINES.find(l => l.code === code) || {};
const lineName  = code => lineOf(code).name  || code;
const lineShort = code => lineOf(code).short || code;

/* =========================================================================
   4. DERMAGA — Pelabuhan Tanjung Priok
   ========================================================================= */
const BERTHS = [
  {code:'NPCT1-01', terminal:'New Priok Container Terminal 1', length:400, depth:16.0},
  {code:'NPCT1-02', terminal:'New Priok Container Terminal 1', length:400, depth:16.0, maintenance:'Perawatan fender & bollard'},
  {code:'JICT-01',  terminal:'Jakarta International Container Terminal', length:250, depth:14.0},
  {code:'JICT-02',  terminal:'Jakarta International Container Terminal', length:250, depth:14.0},
  {code:'JICT-03',  terminal:'Jakarta International Container Terminal', length:230, depth:12.5},
  {code:'KOJA-01',  terminal:'Terminal Peti Kemas Koja', length:225, depth:14.0},
  {code:'KOJA-02',  terminal:'Terminal Peti Kemas Koja', length:225, depth:14.0},
  {code:'MAL-01',   terminal:'Terminal Mustika Alam Lestari', length:200, depth:12.0},
  {code:'NUS-01',   terminal:'Terminal Penumpang Nusantara Pura', length:180, depth:10.0},
  {code:'IKT-01',   terminal:'Indonesia Kendaraan Terminal', length:220, depth:11.0},
  {code:'TCC-01',   terminal:'Terminal Curah Cair Jakarta', length:180, depth:12.0},
  {code:'TCK-01',   terminal:'Terminal Curah Kering', length:160, depth:11.0}
];

/* =========================================================================
   5. KAPAL — posisi operasional pada jendela 24 jam berjalan
   ========================================================================= */
const VESSELS = [
  {name:'KM Meratus Jayakarta', type:'Peti Kemas', line:'MERATUS', imo:'9294185', flag:'Indonesia', gt:9204, loa:147,
   voyage:'V-142/TPK', origin:'Surabaya (Tanjung Perak)', destination:'Jakarta (Tanjung Priok)',
   eta:'03:40', etd:'15:20', ata:'03:55', atd:'—', berth:'NPCT1-01',
   pilot:'Capt. Ahmad Fauzi', tug:'KT Bima 301', cargo:'Discharging', customs:'Cleared', status:'Loading'},

  {name:'KM Oriental Galaxy', type:'Peti Kemas', line:'SPIL', imo:'9401566', flag:'Indonesia', gt:12680, loa:158,
   voyage:'V-078/SBY', origin:'Makassar (Soekarno–Hatta)', destination:'Jakarta (Tanjung Priok)',
   eta:'01:10', etd:'13:45', ata:'01:25', atd:'—', berth:'JICT-01',
   pilot:'Capt. Budi Santoso', tug:'KT Anggada II', cargo:'Discharging', customs:'Cleared', status:'Discharging'},

  {name:'KM Tanto Sejahtera', type:'Peti Kemas', line:'TANTO', imo:'9137272', flag:'Indonesia', gt:8420, loa:139,
   voyage:'V-311/BJM', origin:'Banjarmasin (Trisakti)', destination:'Jakarta (Tanjung Priok)',
   eta:'05:25', etd:'18:00', ata:'05:40', atd:'—', berth:'JICT-02',
   pilot:'Capt. Rizal Hakim', tug:'KT Bima 305', cargo:'Pending', customs:'In Review', status:'Berthed'},

  {name:'MV Sinar Sumba', type:'Peti Kemas', line:'SAMUDERA', imo:'9312688', flag:'Indonesia', gt:14210, loa:165,
   voyage:'V-205/SIN', origin:'Singapura', destination:'Jakarta (Tanjung Priok)',
   eta:'06:15', etd:'20:30', ata:'06:35', atd:'—', berth:'JICT-03',
   pilot:'Capt. Slamet Riyadi', tug:'KT Bima 302', cargo:'Pending', customs:'In Review', status:'Berthed'},

  {name:'KM Bali Mas', type:'Peti Kemas', line:'TEMAS', imo:'9155482', flag:'Indonesia', gt:7860, loa:132,
   voyage:'V-419/MKS', origin:'Jakarta (Tanjung Priok)', destination:'Makassar (Soekarno–Hatta)',
   eta:'02:50', etd:'14:10', ata:'03:05', atd:'—', berth:'KOJA-01',
   pilot:'Capt. Made Wirawan', tug:'KT Jayanegara 201', cargo:'Loading', customs:'Cleared', status:'Loading'},

  {name:'KM Meratus Tomini', type:'Peti Kemas', line:'MERATUS', imo:'9276042', flag:'Indonesia', gt:9105, loa:145,
   voyage:'V-166/BTM', origin:'Batam (Batu Ampar)', destination:'Jakarta (Tanjung Priok)',
   eta:'04:00', etd:'16:45', ata:'04:47', atd:'—', berth:'KOJA-02', delayMin:47,
   pilot:'Capt. Ferry Mangunsong', tug:'KT Bima 306', cargo:'Discharging', customs:'Held', status:'Delayed'},

  {name:'KM Logistik Nusantara 2', type:'Kargo Umum', line:'DJL', imo:'9143257', flag:'Indonesia', gt:6540, loa:121,
   voyage:'TL-024/SRG', origin:'Jakarta (Tanjung Priok)', destination:'Sorong (Papua Barat Daya)',
   eta:'07:30', etd:'21:15', ata:'07:52', atd:'—', berth:'MAL-01',
   pilot:'Capt. Dwi Nugroho', tug:'KT Bima 301', cargo:'Loading', customs:'Cleared', status:'Loading'},

  {name:'KM Kelud', type:'Kapal Penumpang', line:'PELNI', imo:'9130389', flag:'Indonesia', gt:14685, loa:146,
   voyage:'V-093/BTM', origin:'Batam (Batu Ampar)', destination:'Jakarta (Tanjung Priok)',
   eta:'08:00', etd:'19:00', ata:'08:14', atd:'—', berth:'NUS-01',
   pilot:'Capt. Ahmad Fauzi', tug:'KT Anggada II', cargo:'Completed', customs:'Cleared', status:'Berthed'},

  {name:'MT Gamsunoro', type:'Tanker Minyak', line:'PIS', imo:'9407510', flag:'Indonesia', gt:57642, loa:244,
   voyage:'V-058/BPP', origin:'Balikpapan (Kalimantan Timur)', destination:'Jakarta (Tanjung Priok)',
   eta:'00:40', etd:'12:30', ata:'00:58', atd:'—', berth:'TCC-01',
   pilot:'Capt. Budi Santoso', tug:'KT Bima 305', cargo:'Discharging', customs:'Cleared', status:'Discharging'},

  {name:'MV Adhiguna Tarahan', type:'Curah Kering', line:'BAI', imo:'9508312', flag:'Indonesia', gt:18960, loa:178,
   voyage:'V-031/TRH', origin:'Tarahan (Lampung)', destination:'Jakarta (Tanjung Priok)',
   eta:'10:20', etd:'23:40', ata:'—', atd:'—', berth:'—',
   pilot:'Menunggu penugasan', tug:'—', cargo:'Pending', customs:'Pending', status:'Arriving'},

  {name:'KM Oriental Diamond', type:'Peti Kemas', line:'SPIL', imo:'9423241', flag:'Indonesia', gt:12980, loa:159,
   voyage:'V-081/PNK', origin:'Pontianak (Dwikora)', destination:'Jakarta (Tanjung Priok)',
   eta:'11:45', etd:'22:50', ata:'—', atd:'—', berth:'—',
   pilot:'Menunggu penugasan', tug:'—', cargo:'Pending', customs:'Pending', status:'Arriving'},

  {name:'KM Dobonsolo', type:'Kapal Penumpang', line:'PELNI', imo:'9078044', flag:'Indonesia', gt:14685, loa:146,
   voyage:'V-104/SMG', origin:'Semarang (Tanjung Emas)', destination:'Jakarta (Tanjung Priok)',
   eta:'13:20', etd:'—', ata:'—', atd:'—', berth:'—',
   pilot:'Menunggu penugasan', tug:'—', cargo:'Pending', customs:'Pending', status:'Arriving'},

  {name:'MT Sanana', type:'Tanker Minyak', line:'PIS', imo:'9312107', flag:'Indonesia', gt:31280, loa:186,
   voyage:'V-072/PLJ', origin:'Palembang (Plaju)', destination:'Jakarta (Tanjung Priok)',
   eta:'09:15', etd:'20:00', ata:'09:58', atd:'—', berth:'—', delayMin:43,
   pilot:'Menunggu dermaga kosong', tug:'—', cargo:'Pending', customs:'In Review', status:'Delayed'},

  {name:'KM Papua Mas', type:'Peti Kemas', line:'TEMAS', imo:'9169900', flag:'Indonesia', gt:8120, loa:136,
   voyage:'V-402/JYP', origin:'Jayapura (Papua)', destination:'Jakarta (Tanjung Priok)',
   eta:'20:10', etd:'02:40', ata:'20:22', atd:'02:55', berth:'JICT-02',
   pilot:'Capt. Rizal Hakim', tug:'KT Bima 302', cargo:'Completed', customs:'Cleared', status:'Departed'},

  {name:'KM Tanto Alam', type:'Peti Kemas', line:'TANTO', imo:'9127227', flag:'Indonesia', gt:8375, loa:138,
   voyage:'V-298/SBY', origin:'Jakarta (Tanjung Priok)', destination:'Surabaya (Tanjung Perak)',
   eta:'18:30', etd:'04:20', ata:'18:41', atd:'04:35', berth:'KOJA-01',
   pilot:'Capt. Made Wirawan', tug:'KT Jayanegara 201', cargo:'Completed', customs:'Cleared', status:'Departed'},

  {name:'KM Mutiara Persada III', type:'RoRo Kendaraan', line:'ALP', imo:'8919342', flag:'Indonesia', gt:11486, loa:151,
   voyage:'V-127/PNJ', origin:'Panjang (Lampung)', destination:'Jakarta (Tanjung Priok)',
   eta:'19:40', etd:'05:10', ata:'19:55', atd:'05:26', berth:'IKT-01',
   pilot:'Capt. Dwi Nugroho', tug:'KT Bima 306', cargo:'Completed', customs:'Cleared', status:'Departed'},

  {name:'KM Verizon', type:'Peti Kemas', line:'SPIL', imo:'9226037', flag:'Indonesia', gt:10240, loa:150,
   voyage:'V-064/BLW', origin:'Belawan (Medan)', destination:'Jakarta (Tanjung Priok)',
   eta:'21:05', etd:'06:30', ata:'21:18', atd:'06:44', berth:'NPCT1-01',
   pilot:'Capt. Slamet Riyadi', tug:'KT Bima 305', cargo:'Completed', customs:'Cleared', status:'Departed'},

  {name:'KM Meratus Sibolga', type:'Peti Kemas', line:'MERATUS', imo:'9281899', flag:'Indonesia', gt:8930, loa:142,
   voyage:'V-158/BTG', origin:'Bitung (Sulawesi Utara)', destination:'Jakarta (Tanjung Priok)',
   eta:'17:15', etd:'03:00', ata:'17:30', atd:'03:22', berth:'JICT-01',
   pilot:'Capt. Ferry Mangunsong', tug:'KT Anggada II', cargo:'Completed', customs:'Cleared', status:'Departed'},

  {name:'MV Sinar Bangka', type:'Peti Kemas', line:'SAMUDERA', imo:'9364485', flag:'Indonesia', gt:13760, loa:161,
   voyage:'V-198/PKL', origin:'Port Klang (Malaysia)', destination:'Jakarta (Tanjung Priok)',
   eta:'22:40', etd:'07:50', ata:'22:56', atd:'08:05', berth:'JICT-03',
   pilot:'Capt. Budi Santoso', tug:'KT Bima 301', cargo:'Completed', customs:'Cleared', status:'Departed'}
];

/* =========================================================================
   6. AGREGAT HARIAN — mengikuti satuan pelaporan resmi pelabuhan
   ========================================================================= */
const DAILY = {
  shipCalls:38,  shipCallsDelta:'+3 vs kemarin', shipCallsUp:true,
  departures:34, departuresDelta:'-2 vs kemarin', departuresUp:false,
  teu:18420,     teuDelta:'+6,2%',  teuUp:true,
  tons:46180,    tonsDelta:'+4,1%', tonsUp:true,
  yor:68.4,      yorDelta:'-2,5%',  yorUp:true,
  bsh:56.2,      bshDelta:'+3,8%',  bshUp:true,
  bch:28.4,
  waitingTime:1.4, waitingDelta:'-0,3 jam', waitingUp:true,
  portStay:14.2,
  passengers:1842, passengerCapacity:3500,
  yardUsed:8412,   yardCapacity:11000
};

/* =========================================================================
   7. PERINGATAN OPERASIONAL
   ========================================================================= */
const ALERTS = [
  {sev:'crit', title:'Kepadatan alur diprediksi di Alur Pelayaran Barat',       meta:'VTS Tanjung Priok · 18 menit lalu'},
  {sev:'warn', title:'KM Meratus Tomini terlambat 47 menit dari ETA',            meta:'Vessel Board · 26 menit lalu'},
  {sev:'warn', title:'KT Bima 302 masuk jadwal docking dalam 2 jam',             meta:'PT Jasa Armada Indonesia · 40 menit lalu'},
  {sev:'info', title:'Clearance kepabeanan tertunda — 3 kapal',                  meta:'Bea Cukai Tanjung Priok · 1 jam lalu'},
  {sev:'crit', title:'Peringatan gelombang 1,25–2,0 m di Perairan Utara Jakarta',meta:'BMKG Maritim Tanjung Priok · 1 jam 20 menit lalu'}
];

/* =========================================================================
   8. JADWAL HARI INI
   ========================================================================= */
const SCHEDULE = [
  {t:'06:20', label:'KM Kelud — Kedatangan',                      sub:'Nusantara Pura · Pandu naik ke kapal',             col:PALETTE.primary},
  {t:'07:45', label:'KM Bali Mas — Mulai Muat',                   sub:'Koja 01 · Operasi peti kemas',                     col:PALETTE.success},
  {t:'09:10', label:'KM Verizon — Keberangkatan',                 sub:'NPCT1 01 · KT Bima 305 ditugaskan',                col:PALETTE.muted},
  {t:'11:30', label:'MT Gamsunoro — Bunkering',                   sub:'Terminal Curah Cair · Tongkang BBM menuju lokasi', col:PALETTE.warning},
  {t:'13:15', label:'KM Meratus Tomini — Pemeriksaan Bea Cukai',  sub:'Koja 02 · Ditahan menunggu dokumen PIB',           col:PALETTE.danger},
  {t:'15:50', label:'KM Oriental Diamond — Kedatangan',           sub:'JICT · Capt. Rizal Hakim ditugaskan',              col:PALETTE.primary}
];

/* =========================================================================
   9. MUATAN, PERALATAN, GUDANG
   ========================================================================= */
const CARGO = [
  {label:'Peti Kemas (TEU)',   val:18420, max:24000, col:PALETTE.primary},
  {label:'Curah Kering (ton)', val:19600, max:26000, col:PALETTE.accent},
  {label:'Curah Cair (ton)',   val:14380, max:20000, col:PALETTE.success},
  {label:'Kargo Umum (ton)',   val:12200, max:18000, col:PALETTE.warning}
];

const CRANES = [
  {name:'CC-01',  terminal:'JICT',  util:88},
  {name:'CC-02',  terminal:'JICT',  util:84},
  {name:'CC-03',  terminal:'JICT',  util:79},
  {name:'CC-04',  terminal:'JICT',  util:0, note:'Perawatan berkala'},
  {name:'CC-05',  terminal:'NPCT1', util:91},
  {name:'CC-06',  terminal:'NPCT1', util:86},
  {name:'RTG-11', terminal:'Koja',  util:73},
  {name:'RTG-12', terminal:'Koja',  util:68}
];

const TUGS = [
  {name:'KT Bima 301',       operator:'PT Jasa Armada Indonesia', status:'In Operation', assign:'KM Meratus Jayakarta'},
  {name:'KT Bima 302',       operator:'PT Jasa Armada Indonesia', status:'Maintenance',  assign:'Docking terjadwal'},
  {name:'KT Bima 305',       operator:'PT Jasa Armada Indonesia', status:'In Operation', assign:'MT Gamsunoro'},
  {name:'KT Bima 306',       operator:'PT Jasa Armada Indonesia', status:'Available',    assign:'Siaga di kolam pelabuhan'},
  {name:'KT Anggada II',     operator:'PT Jasa Armada Indonesia', status:'In Operation', assign:'KM Kelud'},
  {name:'KT Jayanegara 201', operator:'PT Jasa Armada Indonesia', status:'Available',    assign:'Siaga di kolam pelabuhan'},
  {name:'MP Pandu 12',       operator:'Pelindo Regional 2',       status:'In Operation', assign:'Pemanduan alur barat'},
  {name:'MP Pandu 15',       operator:'Pelindo Regional 2',       status:'Available',    assign:'Siaga di stasiun pandu'}
];

const WAREHOUSES = [
  {name:'Gudang 001 — Kargo Umum',                   pct:64},
  {name:'Gudang 105 — Kawasan Berikat',              pct:81},
  {name:'Gudang CDC — Cold Storage Hasil Perikanan', pct:47},
  {name:'Gudang 209 — Curah Kering',                 pct:92}
];

const EQUIPMENT = [
  {name:'Reach Stacker RS-01',    status:'Operational'},
  {name:'Reach Stacker RS-02',    status:'Operational'},
  {name:'Forklift FL-05',         status:'Maintenance'},
  {name:'RTG-03 Koja',            status:'Operational'},
  {name:'Terminal Tractor TT-11', status:'Operational'}
];

/* =========================================================================
   10. ANALITIK
   ========================================================================= */
const AI_INSIGHTS = [
  {title:'Potensi kepadatan di Koja 02',
   body:'ETA KM Oriental Diamond dan MT Sanana beririsan dalam rentang 90 menit — disarankan mengalihkan satu kapal ke NPCT1 02 setelah perawatan selesai.'},
  {title:'Waiting time menurun',
   body:'Rata-rata waiting time turun 12% dibanding pekan lalu setelah penjadwalan ulang pemanduan pada jam sibuk 06.00–10.00 WIB.'},
  {title:'Peluang efisiensi armada tunda',
   body:'KT Bima 306 dan KT Jayanegara 201 tercatat idle 22% pada jam puncak — pertimbangkan penyeimbangan shift.'},
  {title:'Hambatan clearance kepabeanan',
   body:'3 kapal menunggu pemeriksaan dokumen lebih dari 4 jam di Bea Cukai Tanjung Priok — ditandai untuk prioritas.'}
];

const HOURS_24  = Array.from({length:24}, (_, i) => i);
const DAYS_ID   = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
const DAYS_14   = Array.from({length:14}, (_, i) => 'H-' + (14 - i));
const MONTHS_12 = ['Agu','Sep','Okt','Nov','Des','Jan','Feb','Mar','Apr','Mei','Jun','Jul'];

const SERIES = {
  arrivals:       [1,1,0,2,3,2,1,2,3,4,3,2,1,2,3,4,3,2,2,1,1,2,1,1],
  departures:     [0,1,1,1,2,2,3,2,2,3,2,3,2,1,2,2,3,2,1,1,1,0,1,1],
  cargoContainer: [17800,18400,19100,18950,19600,16400,13200],
  cargoDryBulk:   [ 9200, 9800,10400, 9600,11200, 8400, 6100],
  cargoLiquid:    [ 5400, 5900, 6100, 5700, 6300, 4800, 3600],
  berthUtil:      [92,0,88,84,79,81,76,68,42,35,71,28],
  delay:          [52,48,45,51,43,39,41,44,38,36,40,35,33,31],
  peakHour:       [3,2,2,3,5,7,9,11,13,14,12,10,9,11,13,15,14,12,9,7,6,5,4,3],
  waiting:        [2.1,1.9,2.4,2.0,1.8,1.6,1.7,1.9,1.5,1.4,1.6,1.3,1.4,1.2],
  radar:          [75,81,68,72,79,86],
  revenueIdx:     [78,81,84,80,88,92,86,90,94,97,93,100],
  callIdx:        [72,75,79,77,83,86,82,85,89,91,88,95]
};

/* =========================================================================
   11. EKSEKUTIF
   ========================================================================= */
const EXEC = {
  period:'Periode Juli 2026 · Pelabuhan Tanjung Priok — Pelindo Regional 2',
  kpis:[
    {icon:'revenue',     label:'Pendapatan Pelabuhan (MTD)', value:'Rp 842,6', unit:'Miliar', delta:'+7,8%',    up:true},
    {icon:'movement',    label:'Kunjungan Kapal (MTD)',      value:'1.284',    unit:'call',   delta:'+4,1%',    up:true},
    {icon:'volume',      label:'Arus Peti Kemas (MTD)',      value:'612.400',  unit:'TEU',    delta:'+5,6%',    up:true},
    {icon:'passenger',   label:'Arus Penumpang (MTD)',       value:'42.180',   unit:'pax',    delta:'+9,2%',    up:true},
    {icon:'turnaround',  label:'Turn Round Time',            value:'14,2',     unit:'jam',    delta:'-1,1 jam', up:true},
    {icon:'utilization', label:'BOR Rata-rata (MTD)',        value:'78,4',     unit:'%',      delta:'+3,0%',    up:true}
  ],
  summary:[
    'Kinerja Pelabuhan Tanjung Priok pada periode Juli 2026 berada di atas target, dengan <b>kunjungan kapal naik 4,1%</b> dan arus peti kemas mencapai <b>612.400 TEU</b>, terutama didorong pertumbuhan trayek domestik Surabaya, Makassar dan Banjarmasin.',
    'Turn round time membaik ke <b>14,2 jam</b>, turun 1,1 jam dibanding periode sebelumnya, sebagai dampak revisi protokol alokasi dermaga di NPCT1 dan penambahan kesiapan kapal tunda pada jam puncak.',
    'Berth Occupancy Ratio tercatat <b>78,4%</b>. Investasi lanjutan pada otomasi container crane serta optimalisasi lapangan penumpukan direkomendasikan untuk menjaga pertumbuhan arus barang pada kuartal berikutnya.'
  ]
};

/* =========================================================================
   12. PESAN
   ========================================================================= */
const MSG_SOURCES = [
  {id:'all',     label:'Semua'},
  {id:'AIS',     label:'AIS'},
  {id:'VTS',     label:'VTS'},
  {id:'Line',    label:'Perusahaan Pelayaran'},
  {id:'Customs', label:'Bea Cukai'},
  {id:'Notice',  label:'KSOP'},
  {id:'Pilot',   label:'Pemanduan'},
  {id:'Tug',     label:'Kapal Tunda'},
  {id:'System',  label:'Sistem'}
];
const MSG_LABEL = Object.fromEntries(MSG_SOURCES.map(s => [s.id, s.label]));

const MESSAGES = [
  {src:'AIS',     title:'Laporan posisi diterima — KM Meratus Jayakarta',      meta:'06°05′ LS 106°53′ BT · SOG 8,2 kt',                  t:'14:32:08', parse:'ok',   valid:'valid'},
  {src:'VTS',     title:'Maklumat lalu lintas — kepadatan Alur Pelayaran Barat',meta:'VTS Tanjung Priok · Sektor 3',                      t:'14:28:41', parse:'ok',   valid:'valid'},
  {src:'Line',    title:'Perubahan jadwal voyage V-166/BTM',                    meta:'PT Meratus Line',                                    t:'14:20:15', parse:'ok',   valid:'review'},
  {src:'Customs', title:'Clearance ditahan — dokumen PIB belum lengkap',        meta:'Bea Cukai Tanjung Priok · KM Meratus Tomini',        t:'14:05:52', parse:'ok',   valid:'invalid'},
  {src:'Notice',  title:'Jadwal perawatan dermaga NPCT1 02',                    meta:'KSOP Utama Tanjung Priok · Maklumat Pelayaran',      t:'13:58:03', parse:'ok',   valid:'valid'},
  {src:'Pilot',   title:'Pandu naik ke kapal dikonfirmasi — KM Kelud',          meta:'Stasiun Pandu Tanjung Priok · Capt. Ahmad Fauzi',    t:'13:44:19', parse:'ok',   valid:'valid'},
  {src:'Tug',     title:'Penugasan tunda diperbarui — KT Bima 306',             meta:'PT Jasa Armada Indonesia · Koja 02',                 t:'13:30:02', parse:'ok',   valid:'valid'},
  {src:'System',  title:'Feed radar tersambung kembali — Sektor 2',             meta:'Monitor Kesehatan Sistem PMS',                      t:'13:12:47', parse:'warn', valid:'valid'},
  {src:'AIS',     title:'Pembaruan data statis — MV Sinar Sumba',               meta:'IMO 9312688 · Draft 9,4 m',                          t:'12:55:30', parse:'ok',   valid:'valid'},
  {src:'Customs', title:'Clearance disetujui — MT Gamsunoro',                   meta:'Bea Cukai Tanjung Priok · Meja 2',                   t:'12:40:11', parse:'ok',   valid:'valid'},
  {src:'Notice',  title:'Prakiraan cuaca maritim harian diterbitkan',           meta:'BMKG Maritim Tanjung Priok',                         t:'12:15:44', parse:'ok',   valid:'valid'},
  {src:'VTS',     title:'Izin masuk alur diberikan — KM Oriental Diamond',      meta:'VTS Tanjung Priok · Sektor 1',                       t:'11:58:21', parse:'ok',   valid:'valid'}
];

/* =========================================================================
   13. LAPORAN & COPILOT
   ========================================================================= */
const REPORTS = [
  {title:'Laporan Kunjungan Kapal', desc:'Catatan lengkap kedatangan, keberangkatan dan voyage kapal pada periode terpilih.', icon:'movement',  exportable:true},
  {title:'Laporan Sandar Dermaga',  desc:'Riwayat alokasi dermaga, durasi okupansi dan BOR per dermaga.',                     icon:'berth',     exportable:true},
  {title:'Laporan Arus Barang',     desc:'Arus barang dirinci menurut kategori muatan, kapal dan terminal.',                  icon:'cargo',     exportable:true},
  {title:'Laporan Arus Penumpang',  desc:'Lalu lintas terminal penumpang, jumlah embarkasi dan debarkasi.',                   icon:'passenger', exportable:false},
  {title:'Laporan Utilisasi Alat',  desc:'Ringkasan utilisasi container crane, kapal tunda, kapal pandu dan dermaga.',        icon:'crane',     exportable:false},
  {title:'Laporan KPI Operasional', desc:'Kinerja KPI operasional terkonsolidasi (BOR, YOR, BSH, BCH) terhadap target.',      icon:'occupancy', exportable:false},
  {title:'Audit Log',               desc:'Jejak audit penuh atas tindakan operator dan perubahan data.',                      icon:'delay',     exportable:false}
];

const QUICK_ACTIONS = [
  'Prediksi ETA', 'Prediksi Ketersediaan Dermaga', 'Deteksi Kepadatan', 'Rekomendasi Alokasi Dermaga',
  'Rekomendasi Penugasan Tunda', 'Deteksi Anomali Operasional', 'Ringkasan Operasi Harian'
];

/* =========================================================================
   14. DERIVED — dihitung sekali dari data di atas.

   Tujuannya agar tidak ada angka yang saling bertentangan antar halaman:
   BOR di KPI Dashboard, kartu dermaga di halaman Resources dan titik kapal
   pada peta semuanya berasal dari perhitungan yang sama.
   ========================================================================= */
const berthOf = {};
VESSELS.forEach(v => {
  if(v.berth !== '—' && v.status !== 'Departed') berthOf[v.berth] = v;
});

const BERTH_STATE = BERTHS.map(b => {
  const vessel = berthOf[b.code];
  const status = vessel ? 'Occupied' : (b.maintenance ? 'Maintenance' : 'Available');
  const color  = status === 'Occupied'    ? PALETTE.success
               : status === 'Maintenance' ? PALETTE.warning
               : PALETTE.primary;
  return Object.assign({}, b, {vessel, status, color});
});

const DERIVED = {
  berthsTotal:    BERTHS.length,
  berthsOccupied: BERTH_STATE.filter(b => b.status === 'Occupied').length,
  cranesReady:    CRANES.filter(c => c.util > 0).length,
  cranesTotal:    CRANES.length,
  craneUtil:      CRANES.reduce((sum, c) => sum + c.util, 0) / CRANES.length,
  tugsReady:      TUGS.filter(t => t.name.startsWith('KT') && t.status !== 'Maintenance').length,
  tugsTotal:      TUGS.filter(t => t.name.startsWith('KT')).length,
  pilotsReady:    TUGS.filter(t => t.name.startsWith('MP') && t.status !== 'Maintenance').length,
  pilotsTotal:    TUGS.filter(t => t.name.startsWith('MP')).length
};
DERIVED.bor = DERIVED.berthsOccupied / DERIVED.berthsTotal * 100;

/* Posisi bar timeline (persentase terhadap sumbu 24 jam). */
VESSELS.forEach(v => {
  const start = toHours(v.eta);
  const end   = v.etd === '—' ? start + 6 : toHours(v.etd);
  const dur   = ((end - start) + 24) % 24 || 6;
  v.startPct  = start / 24 * 100;
  v.durPct    = Math.min(dur / 24 * 100, 100 - v.startPct);
});

/* =========================================================================
   EKSPOR
   ========================================================================= */
PMS.data = {
  NAV, PORTS,
  LINES, lineOf, lineName, lineShort,
  BERTHS, BERTH_STATE, VESSELS, DERIVED,
  DAILY, ALERTS, SCHEDULE, CARGO,
  CRANES, TUGS, WAREHOUSES, EQUIPMENT,
  AI_INSIGHTS, HOURS_24, DAYS_ID, DAYS_14, MONTHS_12, SERIES,
  EXEC, MSG_SOURCES, MSG_LABEL, MESSAGES,
  REPORTS, QUICK_ACTIONS
};

})(window.PMS = window.PMS || {});
