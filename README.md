# PMS · Port Management System

Sistem pemantauan operasional pelabuhan — Kementerian Kelautan dan Perikanan
Republik Indonesia.

Aplikasi web statis multi-halaman. Tanpa build step, tanpa dependensi npm.
Buka `index.html` langsung di browser (`file://` cukup, tidak perlu server).

> **Seluruh angka pada aplikasi ini adalah data simulasi** untuk keperluan
> demonstrasi — termasuk nomor IMO, volume muatan dan nilai pendapatan. Nama
> pelabuhan, terminal, dermaga, kapal, operator pelayaran dan instansi
> menggunakan entitas nyata Indonesia agar konteksnya realistis.

## Menjalankan

```bash
# cara paling sederhana
open index.html

# atau lewat server lokal bila ingin menguji dengan URL bersih
python3 -m http.server 8000   # lalu buka http://localhost:8000
```

## Struktur berkas

```
├── index.html               Dashboard                    (data-page="dashboard")
├── vessel-board.html        Vessel Board                 (vesselboard)
├── resources.html           Resource Management          (resources)
├── analytics.html           Analytics                    (analytics)
├── executive.html           Executive Dashboard          (executive)
├── messages.html            Maritime Communication       (messages)
├── reports.html             Reports                      (reports)
├── shipping-lines.html      Perusahaan Pelayaran         (shippinglines)
├── vessels.html             Registri Kapal               (vessels)
├── ports.html               Jaringan Pelabuhan           (ports)
│
├── assets/
│   ├── css/
│   │   ├── base.css         design token, reset, tipografi        (muat ke-1)
│   │   ├── layout.css       topbar, sidebar, area utama, grid     (muat ke-2)
│   │   ├── components.css   seluruh komponen UI                   (muat ke-3)
│   │   └── responsive.css   semua breakpoint                      (muat ke-4)
│   ├── img/
│   │   └── logo-kkp.svg     lambang KKP
│   └── js/
│       ├── utils.js         helper DOM, format angka, ikon, warna status
│       ├── data.js          SUMBER DATA TUNGGAL + nilai turunan (BOR, dsb.)
│       ├── render.js        kerangka halaman + komponen lintas halaman
│       ├── pages.js         builder isi tiap halaman + konfigurasi grafik
│       ├── copilot.js       panel asisten
│       └── app.js           bootstrap, event, pemilihan builder per halaman
│
└── dokumentasi
    ├── README.md            berkas ini — ikhtisar & cara pakai
    ├── PRD.md               kebutuhan produk: tujuan, pengguna, ruang lingkup
    ├── DESIGN.md            design system: token, komponen, aturan visual
    ├── IMPLEMENTATION.md    detail teknis & panduan mengubah kode
    ├── SKILL.md             instruksi kerja untuk agen AI di repositori ini
    └── MEMORY.md            catatan keputusan & konteks yang mudah hilang
```

## Cara kerja singkat

Setiap halaman HTML hanya berisi `<main>` dengan isi khasnya. Topbar, sidebar,
panel copilot, toast dan footer **dirender oleh JavaScript** supaya tidak
disalin sepuluh kali.

Yang membedakan satu halaman dari yang lain hanya satu atribut:

```html
<body data-page="vesselboard">
```

`app.js` membaca atribut itu, menandai item sidebar yang aktif, lalu
menjalankan builder yang sesuai dari `pages.js`. Halaman dengan `data-page`
yang tidak dikenali tetap mendapat kerangka lengkap tanpa error.

## Dua urutan yang tidak boleh ditukar

**CSS** — `responsive.css` harus terakhir. Aturan di dalamnya memakai selector
dengan specificity yang sama seperti di `layout.css`/`components.css`, sehingga
pemenang cascade ditentukan oleh urutan berkas, bukan oleh media query. Kalau
posisinya ditukar, layout mobile berhenti bekerja tanpa pesan error.

**JS** — `utils → data → render → pages → copilot → app`. Tiap berkas
mendaftarkan diri pada namespace global `window.PMS` (`PMS.utils`, `PMS.data`,
…). Pola namespace dipilih, bukan ES module, agar halaman tetap bisa dibuka
langsung lewat `file://` — ES module diblokir CORS tanpa web server.

## Menambah halaman baru

1. Tambahkan entri pada `NAV` di `assets/js/data.js` (`id`, `label`, `href`, `svg`).
2. Salin salah satu berkas halaman, ubah `<title>` dan `data-page` agar sama
   dengan `id` tadi, isi `<main>`.
3. Tambahkan builder di `pages.js` dan daftarkan pada `BUILDERS` di `app.js`.

Detail lengkap ada di [IMPLEMENTATION.md](IMPLEMENTATION.md).

## Mengganti lambang KKP

`assets/img/logo-kkp.svg` saat ini berisi render SVG **bergaya**, bukan
reproduksi persis lambang resmi. Untuk memakai lambang resmi, cukup timpa
berkas tersebut — tidak ada kode lain yang perlu diubah.

## Data

Semua angka bersumber dari `assets/js/data.js`. Nilai yang bisa dihitung
(okupansi dermaga, BOR, kesiapan crane/tunda/pandu) diturunkan di blok
`DERIVED`, bukan ditulis ulang per halaman — supaya tidak ada angka yang
saling bertentangan antar halaman.

KPI memakai istilah pelaporan resmi pelabuhan Indonesia: **BOR** (Berth
Occupancy Ratio), **YOR** (Yard Occupancy Ratio), **BSH** (Box per Ship per
Hour), **BCH** (Box per Crane Hour), waiting time, dan turn round time.
