# PMS · Port Management System

Dashboard pemantauan operasional pelabuhan — Kementerian Kelautan dan Perikanan
Republik Indonesia.

Halaman statis tanpa build step. Buka `index.html` langsung di browser
(bisa lewat `file://`, tidak perlu server).

## Struktur berkas

```
index.html                    markup saja — seluruh isi dinamis diisi oleh JS
assets/
├── css/
│   ├── base.css              design token, reset, tipografi        (muat ke-1)
│   ├── layout.css            topbar, sidebar, area utama, grid     (muat ke-2)
│   ├── components.css        seluruh komponen UI                   (muat ke-3)
│   └── responsive.css        semua breakpoint                      (muat ke-4)
├── img/
│   └── logo-kkp.svg          lambang KKP
└── js/
    ├── utils.js              helper DOM, format angka, ikon, warna status
    ├── data.js               SUMBER DATA TUNGGAL + nilai turunan (BOR, dsb.)
    ├── render.js             komponen lintas halaman: nav, KPI, peta, timeline
    ├── pages.js              perakitan tiap halaman + konfigurasi grafik
    ├── copilot.js            panel asisten
    └── app.js                router, event listener, init
```

### Urutan pemuatan itu penting

**CSS** — `responsive.css` harus terakhir. Aturan di dalamnya memakai selector
dengan specificity yang sama seperti di `layout.css`/`components.css`, sehingga
pemenang cascade ditentukan oleh urutan berkas, bukan oleh media query.

**JS** — `utils → data → render → pages → copilot → app`. Setiap berkas
mendaftarkan dirinya pada namespace global `window.PMS` (`PMS.utils`,
`PMS.data`, …). Pola ini dipilih agar halaman tetap bisa dibuka langsung dari
`file://`; ES module akan diblokir CORS tanpa web server.

## Mengganti lambang KKP

`assets/img/logo-kkp.svg` saat ini berisi render SVG **bergaya**, bukan
reproduksi persis lambang resmi. Untuk memakai lambang resmi, cukup timpa
berkas tersebut — tidak ada kode lain yang perlu diubah.

## Data

Nama pelabuhan, terminal, dermaga, perusahaan pelayaran, kapal dan instansi
memakai entitas nyata Indonesia (Pelindo, PELNI, Temas, SPIL, Meratus, JICT,
NPCT1, KSOP, Bea Cukai, BMKG). KPI memakai istilah pelaporan resmi pelabuhan
Indonesia: BOR, YOR, BSH, BCH, waiting time, turn round time.

**Seluruh angka bersifat simulasi** untuk keperluan demonstrasi — termasuk
nomor IMO, volume dan nilai pendapatan.

Semua angka bersumber dari `assets/js/data.js`. Nilai yang bisa dihitung
(okupansi dermaga, BOR, kesiapan crane/tunda/pandu) diturunkan dari data
tersebut di blok `DERIVED`, bukan ditulis ulang per halaman, supaya tidak ada
angka yang saling bertentangan antar halaman.
