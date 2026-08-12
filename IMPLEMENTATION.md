# IMPLEMENTATION.md · Detail Teknis PMS

Panduan teknis untuk mengubah, memperluas, dan memverifikasi kode PMS.
Untuk gambaran umum lihat [README.md](README.md); untuk aturan visual lihat
[DESIGN.md](DESIGN.md).

---

## 1. Arsitektur

Aplikasi web statis **multi-halaman (MPA)**: sepuluh berkas HTML, tanpa
router sisi klien, tanpa build step, tanpa dependensi npm.

```
Browser membuka <halaman>.html
   │
   ├── memuat 4 berkas CSS (urutan penting)
   ├── memuat Chart.js  ← hanya analytics.html & executive.html
   └── memuat 6 berkas JS (urutan penting)
          │
          utils.js   → window.PMS.utils
          data.js    → window.PMS.data     (butuh utils)
          render.js  → window.PMS.render   (butuh utils, data)
          pages.js   → window.PMS.pages    (butuh utils, data, render)
          copilot.js → window.PMS.copilot  (butuh utils, data)
          app.js     → menjalankan init()  (butuh semuanya)
```

### Mengapa namespace global, bukan ES module

Modul ES diblokir CORS saat halaman dibuka lewat `file://`. Persyaratan NF-1
adalah aplikasi dapat dibuka dengan klik ganda tanpa server, jadi tiap berkas
memakai IIFE yang mendaftar ke `window.PMS`:

```js
(function(PMS){
'use strict';
const {$, nf} = PMS.utils;
// …
PMS.namaModul = { /* yang diekspor */ };
})(window.PMS = window.PMS || {});
```

Bila kelak aplikasi disajikan lewat HTTP, konversi ke `import`/`export` hanya
menyentuh baris pertama dan terakhir tiap berkas.

## 2. Cara satu halaman dirakit

Berkas HTML sengaja tipis — hanya berisi `<main>` dengan isi khas halaman itu.
Kerangka dirender JavaScript agar tidak disalin sepuluh kali:

```html
<body data-page="vesselboard">
  <div class="app">
    <header class="topbar" id="topbar"></header>   <!-- diisi renderTopbar() -->
    <nav class="sidebar" id="sidebar"></nav>       <!-- diisi renderNav()    -->
    <main class="main">
      <section class="page"> … isi halaman … </section>
    </main>
  </div>
```

Urutan `init()` di `app.js`:

1. Menyetel default Chart.js (dilewati bila Chart.js tidak dimuat).
2. `renderTopbar()`, `renderNav(PAGE)`, `renderOverlays()`, `renderCredits()`.
3. Mengisi pemilih pelabuhan dan aksi cepat copilot, lalu sapaan copilot.
4. Menjalankan `BUILDERS[PAGE]` — builder isi halaman.
5. `applyPortContext(port)` — subjudul, judul peta, cuaca.
6. `initCharts(PAGE)` — hanya berdampak pada analytics/executive.
7. Menerapkan parameter `?q=` bila halaman Vessel Board.
8. Memasang event kerangka dan event halaman.
9. Menyalakan jam.

`PAGE` dibaca dari `document.body.dataset.page`. Nilai yang tidak dikenal tidak
menyebabkan error: `BUILDERS[PAGE]` bernilai `undefined` dan dilewati, halaman
tetap mendapat kerangka lengkap.

## 3. Kontrak antar modul

| Modul | Mengekspor | Catatan |
|-------|-----------|---------|
| `utils` | `$`, `$$`, `renderList`, `on`, `nf`, `toHours`, `esc`, `seededRandom`, `store`, `queryParam`, `icon`, `PALETTE`, `badge`, `badgeClass`, `statusColor` | Tanpa ketergantungan |
| `data` | `APP`, `NAV`, `PORTS`, `LINES`, `BERTHS`, `BERTH_STATE`, `VESSELS`, `DERIVED`, `DAILY`, dan seluruh dataset lain | Satu-satunya tempat angka |
| `render` | `renderNav`, `renderTopbar`, `renderOverlays`, `renderCredits`, `kpiCard`, `renderPortMap`, `renderWeather`, `renderAlerts`, `buildAxis`, `buildTimeline`, `showToast`, `tickClock`, `downloadCSV` | Komponen lintas halaman |
| `pages` | `buildDashboard`, `buildVesselBoard`, `renderVesselBoard`, `vbState`, `buildResources`, `buildAnalytics`, `buildExecutive`, `initCharts`, `buildMessages`, `renderMessages`, `buildReports`, `buildShippingLines`, `buildVesselRegistry`, `buildPorts` | Satu builder per halaman |
| `copilot` | `ask`, `submitInput`, `greet`, `addMessage` | Menjawab dari `PMS.data` |

### Helper yang wajib dipakai

**`on(selector, event, handler)`** — `addEventListener` yang aman terhadap
elemen tak ada. Karena `app.js` yang sama dimuat di semua halaman, memasang
listener langsung dengan `$('#x').addEventListener` akan melempar
`TypeError: null` di halaman yang tidak punya `#x`. Selalu gunakan `on()`
untuk kontrol khusus halaman.

**`esc(text)`** — escape sebelum menyisipkan nilai data ke template HTML.
Sudah dipakai di seluruh baris tabel dan kartu; ikuti pola yang sama.

**`nf(angka, desimal)`** — format `id-ID`. Jangan memakai
`toLocaleString()` langsung agar formatnya seragam.

**`store`** — pembungkus `localStorage` yang tahan `SecurityError` pada
`file://`, dengan fallback ke memori.

## 4. Data dan nilai turunan

Seluruh angka ada di `assets/js/data.js`. Bagian `DERIVED` di akhir berkas
menghitung ulang apa yang bisa dihitung:

```js
BERTH_STATE  // status tiap dermaga + kapal yang sandar
DERIVED.berthsOccupied / berthsTotal / bor
DERIVED.cranesReady / cranesTotal / craneUtil
DERIVED.tugsReady / pilotsReady
VESSELS[].startPct / durPct   // posisi bar timeline
```

**Aturan:** kalau sebuah angka bisa dihitung dari data lain, hitung di
`DERIVED` — jangan tulis ulang di halaman. Ini yang membuat "9 / 12 dermaga"
di Dashboard, kartu dermaga di Resources, dan titik kapal di peta tidak pernah
saling bertentangan.

### Tanpa keacakan

Tidak ada `Math.random()` pada angka operasional — tampilan harus identik tiap
kali dimuat ulang (NF-8). Tekstur visual yang butuh variasi (heatmap, petak
lapangan penumpukan) memakai `seededRandom(seed)` dengan benih tetap.

## 5. Komponen khusus

### Peta pelabuhan (`renderPortMap`)

SVG `viewBox="0 0 900 380"` yang digambar dari data:

- Persegi dermaga dari `BERTH_STATE`, posisi `x = 34 + i·71`, lebar 58.
- Titik kapal: kapal yang sandar diletakkan di atas dermaganya
  (`berthX(index)`), kapal lain di titik labuh jangkar yang sudah ditentukan.
- Lapisan dibungkus grup ber-id `layerBerths`, `layerVessels`, `layerWind`,
  `layerChannel`. Tombol pengalih memakai `data-layer="Berths"` → dicari
  `#layerBerths`. **Nama grup dan nilai `data-layer` harus tetap sepadan.**

### Timeline (`buildAxis`, `buildTimeline`)

Sumbu 24 jam berupa grid `190px repeat(24,1fr)`. Bar diposisikan persentase
dari `startPct`/`durPct` yang dihitung di `data.js`. Voyage yang melewati
tengah malam ditangani dengan `((end - start) + 24) % 24`.

### Grafik (`initCharts`)

Konfigurasi ada di `CHART_CONFIGS` (`pages.js`). Chart dibuat hanya saat
halamannya dimuat, dan dijaga `Set` agar tidak dibuat dua kali. Semua grafik
memakai `chartOptions(cfg)` yang sama sehingga gaya sumbu, kisi dan legenda
seragam.

Chart.js hanya disertakan di `analytics.html` dan `executive.html`. Kode
mengecek `typeof Chart === 'undefined'` sehingga halaman lain tetap aman.

### Ekspor CSV (`downloadCSV`)

Setiap sel dikutip ganda dan tanda kutip di dalamnya digandakan. Berkas ditulis
dengan **BOM UTF-8** (`'﻿'`) agar Excel membaca nama kapal berhuruf
non-ASCII dengan benar.

## 6. Menambah halaman baru

1. **Daftarkan di navigasi** — `NAV` pada `data.js`:
   ```js
   {id:'tarif', label:'Tarif', href:'tarif.html', svg:'<path …>'}
   ```
2. **Buat berkas halaman** — salin `reports.html`, ubah `<title>` dan
   `data-page="tarif"` (harus sama persis dengan `id` di NAV), isi `<main>`.
   Sertakan Chart.js hanya bila halaman itu memakai grafik.
3. **Tulis builder** di `pages.js`, ekspor lewat `PMS.pages`.
4. **Daftarkan** pada `BUILDERS` di `app.js`:
   ```js
   tarif: () => P.buildTarif(),
   ```
5. **Event khusus halaman** ditambahkan di `wirePageEvents()` memakai `on()`.

## 7. Menambah data

| Yang ditambah | Tempat | Ingat |
|---------------|--------|-------|
| Kapal | `VESSELS` | Isi semua field; `berth` harus cocok dengan kode di `BERTHS` atau `'—'` |
| Dermaga | `BERTHS` | Peta memuat 12 dermaga dengan rapi; lebih dari itu perlu penyesuaian `MAP_GEOM` |
| Operator pelayaran | `LINES` | `code` dipakai sebagai kunci di `VESSELS[].line` |
| Pelabuhan | `PORTS` | Wajib menyertakan objek `weather` lengkap |
| KPI Dashboard | `dashboardKpis()` di `pages.js` | Ambil dari `DAILY` atau `DERIVED`, jangan tulis angka langsung |
| Status kapal baru | `BADGE_CLASS` + `STATUS_COLOR` di `utils.js` | Kalau terlewat, badge jatuh ke kuning secara diam-diam |

## 8. Verifikasi

Tidak ada test runner. Pemeriksaan yang dipakai:

```bash
# 1. Sintaks seluruh berkas JS
for f in assets/js/*.js; do node --check "$f" || echo "GAGAL $f"; done

# 2. href di NAV cocok dengan berkas yang benar-benar ada
#    dan data-page tiap halaman cocok dengan id di NAV

# 3. Setiap $('#id') di builder tersedia di halaman tempat builder itu jalan
#    — ini risiko utama arsitektur MPA

# 4. Tidak ada sisa nama lama
grep -rn -E "PODB|MODB" index.html *.html assets/
```

Pemeriksaan 2 dan 3 dilakukan dengan skrip Python sekali pakai yang membaca
`NAV`, `BUILDERS`, dan atribut `id` di tiap HTML. Bila menambah halaman,
jalankan ulang pemeriksaan itu.

Untuk verifikasi visual, render dengan Chrome headless:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --virtual-time-budget=5000 \
  --screenshot=shot.png --window-size=1600,1150 \
  --user-data-dir=/tmp/pmsprofile "file://$PWD/index.html"
```

## 9. Jebakan yang sudah pernah menggigit

- **`responsive.css` bukan terakhir** → seluruh layout responsif mati tanpa
  pesan error, karena specificity-nya sama dengan `components.css`.
- **`$('#x').addEventListener` langsung** → `TypeError` di halaman yang tidak
  punya elemen itu. Pakai `on()`.
- **Escape di template literal** → menulis `'\\n'` di dalam string JS
  menghasilkan garis miring terbalik harfiah, bukan baris baru. Pernah membuat
  ekspor CSV keluar sebagai satu baris.
- **Chart.js pada canvas tersembunyi** → canvas berukuran nol menghasilkan
  grafik rusak. Di arsitektur MPA sekarang hal ini tidak terjadi lagi karena
  halaman selalu terlihat saat chart dibuat.
- **`Math.random()` pada data operasional** → angka berubah tiap reload dan
  bertentangan antar halaman.
