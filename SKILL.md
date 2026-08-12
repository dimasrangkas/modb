---
name: pms-port-management-system
description: Panduan kerja untuk mengubah PMS Port Management System — dashboard operasional pelabuhan Indonesia berbasis HTML/CSS/JS statis multi-halaman. Gunakan saat menambah atau mengubah halaman, komponen UI, data operasional, KPI, grafik, atau saat memverifikasi perubahan di repositori ini.
---

# Bekerja di PMS Port Management System

Aplikasi web statis multi-halaman untuk pemantauan operasional pelabuhan
Indonesia. Tanpa build step, tanpa npm, tanpa framework. Sepuluh berkas HTML +
4 CSS + 6 JS.

## Baca dulu sebelum mengubah apa pun

1. `README.md` — struktur berkas dan cara kerja singkat.
2. `IMPLEMENTATION.md` — kontrak antar modul dan panduan perubahan.
3. `DESIGN.md` — token dan aturan visual, bila menyentuh tampilan.
4. `MEMORY.md` — keputusan yang sudah diambil dan alasannya.

## Aturan yang tidak boleh dilanggar

### 1. `responsive.css` dimuat terakhir
Aturan di dalamnya memakai specificity yang sama dengan `layout.css` dan
`components.css`. Yang menentukan pemenang cascade adalah urutan berkas, bukan
media query. Menukar urutannya mematikan seluruh layout responsif **tanpa
pesan error**.

### 2. Urutan JS: utils → data → render → pages → copilot → app
Tiap berkas mendaftar ke `window.PMS`. Jangan ubah ke ES module — halaman harus
tetap bisa dibuka lewat `file://`, dan modul ES diblokir CORS di sana.

### 3. Angka hanya boleh berasal dari `assets/js/data.js`
Jangan menulis angka langsung di HTML atau di builder halaman. Nilai yang bisa
dihitung (BOR, dermaga terpakai, kesiapan alat) dihitung di blok `DERIVED`.
Kalau angka yang sama muncul di dua halaman, ia harus berasal dari satu
perhitungan.

### 4. Tidak ada `Math.random()` pada angka operasional
Tampilan harus identik setiap kali dimuat ulang. Untuk tekstur visual yang
butuh variasi (heatmap, petak lapangan penumpukan), pakai `seededRandom(benih)`
dengan benih tetap.

### 5. Selalu pakai `on()` untuk event kontrol khusus halaman
`app.js` yang sama dimuat di semua halaman. `$('#x').addEventListener(...)`
langsung akan melempar `TypeError` di halaman yang tidak punya `#x`.

```js
const {on} = PMS.utils;
on('#vbFilters', 'click', handler);   // aman bila elemen tak ada
```

### 6. Escape data sebelum masuk HTML
Gunakan `esc()` pada setiap nilai data yang disisipkan ke template literal.

### 7. Format angka lewat `nf()`
Locale `id-ID`: `18.420`, `1,4`. Jangan panggil `toLocaleString()` langsung.

### 8. Data tetap simulasi, entitas tetap nyata
Nama pelabuhan, terminal, dermaga, kapal, operator dan instansi memakai entitas
nyata Indonesia. Angkanya simulasi. Jangan menghapus keterangan simulasi di
footer, dan jangan menyajikan angka seolah data resmi.

## Alur kerja untuk tugas yang sering muncul

### Menambah halaman baru

1. Tambah entri di `NAV` pada `data.js`: `{id, label, href, svg}`.
2. Salin `reports.html` (paling sederhana), ubah `<title>` dan
   `data-page` agar **sama persis** dengan `id` di NAV, isi `<main>`.
3. Tulis builder di `pages.js`, ekspor lewat `PMS.pages`.
4. Daftarkan di `BUILDERS` pada `app.js`.
5. Event khusus halaman ke `wirePageEvents()` dengan `on()`.
6. Sertakan Chart.js di halaman itu **hanya bila** memakai grafik.

### Menambah atau mengubah data

Semua di `data.js`. Perhatikan:
- `VESSELS[].berth` harus cocok dengan kode di `BERTHS`, atau `'—'`.
- `VESSELS[].line` harus cocok dengan `LINES[].code`.
- Status kapal baru harus didaftarkan di `BADGE_CLASS` dan `STATUS_COLOR`
  (`utils.js`), kalau tidak badge-nya diam-diam jatuh ke kuning.
- Menambah dermaga melebihi 12 memerlukan penyesuaian `MAP_GEOM` di
  `render.js`.

### Menambah komponen berangka

Tambahkan selectornya ke daftar `tabular-nums` di `base.css`, jika tidak
kolomnya bergoyang saat angka berubah.

### Menambah warna

Jangan. Petakan ke enam warna status yang ada (`--primary`, `--secondary`,
`--accent`, `--success`, `--warning`, `--danger`). Kalau benar-benar tidak
masuk, kemungkinan kategorinya yang perlu ditinjau ulang.

## Verifikasi sebelum menyatakan selesai

```bash
# sintaks seluruh JS
for f in assets/js/*.js; do node --check "$f" || echo "GAGAL $f"; done

# tidak ada sisa nama lama
grep -rn -E "PODB|MODB" *.html assets/
```

Lalu periksa secara statis — ini risiko utama arsitektur multi-halaman:

- Setiap `href` di `NAV` menunjuk berkas yang benar-benar ada.
- `data-page` tiap halaman cocok dengan `id` di `NAV` dan kunci di `BUILDERS`.
- Setiap `$('#id')` di dalam builder tersedia di halaman tempat builder itu
  dijalankan.

Skrip pemeriksaan contoh ada di `IMPLEMENTATION.md` bagian 8.

Untuk verifikasi visual, render dengan Chrome headless dan `--screenshot`.
Catatan: di sebagian lingkungan macOS, Chrome headless menjadi tidak stabil
setelah proses Chrome dimatikan paksa (`pkill`) — pakai direktori profil baru,
atau andalkan pemeriksaan statis.

## Yang perlu dikonfirmasi ke pengguna, bukan diputuskan sendiri

- Mengganti nama folder repositori (memutus direktori kerja dan berkas yang
  terbuka di editor).
- Melakukan commit — kerjakan hanya bila diminta.
- Mengganti lambang KKP dengan berkas resmi (hanya pengguna yang punya
  berkasnya; kode sudah menunjuk `assets/img/logo-kkp.svg`).
- Mengubah ruang lingkup produk di luar yang tertulis di `PRD.md`.
