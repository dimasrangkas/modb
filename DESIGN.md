# DESIGN.md · Design System PMS

Panduan visual PMS Port Management System. Sumber kebenaran token ada di
`assets/css/base.css` — dokumen ini menjelaskan **kapan** dan **mengapa**
memakainya.

---

## 1. Prinsip

1. **Angka lebih dulu, hiasan belakangan.** Layar ini dibaca petugas yang
   sedang bekerja. Kontras dan keterbacaan angka mengalahkan estetika.
2. **Satu keluarga font.** Seluruh antarmuka memakai Plus Jakarta Sans. Tidak
   ada font monospace terpisah; angka teknis dibedakan lewat `tabular-nums`.
3. **Warna berarti sesuatu.** Warna status tidak pernah dipakai sebagai
   dekorasi. Hijau berarti aman/selesai, merah berarti butuh tindakan.
4. **Tenang secara default.** Latar terang, kartu putih, garis tipis. Elemen
   yang bergerak hanya yang benar-benar menandakan kondisi langsung.

## 2. Warna

### Token dasar

| Token | Nilai | Pemakaian |
|-------|-------|-----------|
| `--bg` | `#F7FAFC` | Latar halaman |
| `--card` | `#FFFFFF` | Latar kartu, topbar, sidebar |
| `--border` | `#E5EEF5` | Semua garis pemisah dan tepi kartu |
| `--text-hi` | `#1F2937` | Judul, angka utama, nama kapal |
| `--text-mid` | `#6B7280` | Teks isi, label, sel tabel |
| `--text-low` | `#9AA6B2` | Keterangan, satuan, metadata |

### Warna merek dan status

| Token | Nilai | Makna |
|-------|-------|-------|
| `--primary` | `#0077B6` | Aksi utama, navigasi aktif, kapal bergerak |
| `--secondary` | `#005B96` | Label bagian, aksen grafik |
| `--accent` | `#00B4D8` | Aksen sekunder, alur pelayaran, deret grafik kedua |
| `--success` | `#2A9D8F` | Sandar, selesai, clearance disetujui, tersedia |
| `--warning` | `#F4A261` | Perawatan, labuh jangkar, menunggu, kapasitas hampir penuh |
| `--danger` | `#E76F51` | Tertunda, ditahan, peringatan kritis |

**Aturan:** biru laut adalah warna merek, mengacu pada konteks kelautan.
Jangan menambah warna baru untuk kategori baru — petakan ke enam warna status
yang sudah ada. Jika suatu kategori tidak masuk mana pun, kemungkinan
kategorinya yang perlu ditinjau ulang.

### Kontras

Badge kuning memakai teks `#B4762F`, bukan `--warning` langsung, karena oranye
di atas latar terang tidak mencapai rasio kontras yang memadai untuk teks
kecil. Pola yang sama berlaku bila menambah badge baru: warna latar boleh
lembut, warna teksnya harus digelapkan.

## 3. Tipografi

Satu keluarga: **Plus Jakarta Sans** (400, 500, 600, 700, 800).

| Peran | Ukuran | Bobot | Catatan |
|-------|--------|-------|---------|
| Judul halaman (`h1`) | 23px | 800 | `letter-spacing:-.4px` |
| Angka KPI | 25px | 800 | `letter-spacing:-.5px` |
| Judul kartu (`h2`) | 15–16px | 700 | |
| Judul grafik (`h3`) | 14.5px | 700 | |
| Teks isi | 12.5–13.5px | 400–600 | |
| Label bagian | 11px | 700 | huruf besar, `letter-spacing:1.2px` |
| Metadata, satuan | 10–11.5px | 500 | warna `--text-low` |

### Angka tabular

Semua elemen yang menampilkan angka berubah — sel tabel, jam, bar timeline,
nilai KPI, badge okupansi — mewarisi `font-variant-numeric: tabular-nums` dari
daftar selector di `base.css`. **Saat menambah komponen berangka, tambahkan
selectornya ke daftar itu**, jika tidak kolomnya akan bergoyang saat nilai
diperbarui.

### Format angka

Selalu lewat `PMS.utils.nf()` yang memakai locale `id-ID`:
ribuan dengan titik, desimal dengan koma — `18.420`, `1,4`, `75,0%`.

## 4. Spasi, radius, bayangan

- **Spasi** kelipatan 2px, umumnya 8/10/12/14/16/20/22px.
- **Radius:** `--r-lg` 16px (kartu), `--r-md` 12px (kartu kecil), `--r-sm` 8px,
  100px untuk pil dan badge.
- **Bayangan:** `--shadow-1` untuk kartu diam, `--shadow-2` untuk elemen
  melayang (toast, FAB, panel geser). Tidak ada tingkat ketiga.

## 5. Komponen

### Kartu (`.card`)
Latar putih, tepi 1px `--border`, radius 16px, `--shadow-1`. Semua blok konten
memakai ini sebagai dasar; varian ditambahkan lewat kelas kedua
(`.kpi`, `.side-card`, `.chart-card`, `.map-card`, `.dir-card`, `.report-card`).

### Kartu KPI (`.kpi`)
Susunan tetap: ikon → label → nilai + satuan → delta. Delta selalu memiliki
arah (`▲`/`▼`) dan warna (`.up` hijau / `.down` merah).

> **Perhatian:** arah panah menyatakan arah perubahan angka, sedangkan warna
> menyatakan apakah perubahan itu **baik**. Waiting time yang turun memakai
> `▼` dengan warna hijau. Jangan menyamakan keduanya.

### Badge (`.badge`)
Pil dengan titik warna. Lima varian: `.g` hijau, `.b` biru, `.y` kuning,
`.r` merah, `.gray` abu. Pemetaan status → varian ada di `BADGE_CLASS`
(`utils.js`), bukan ditulis di tempat pemakaian.

### Chip filter (`.chip`)
Status aktif dinyatakan lewat `aria-pressed="true"`, bukan kelas `.active` —
CSS menargetkan atributnya langsung sehingga status visual dan status yang
dibacakan pembaca layar tidak mungkin berbeda.

### Tabel
Kepala tabel huruf besar 10px `--text-low`. Baris dipisah garis tipis, hover
`#FAFDFF`. Kolom pertama memakai `.name` (lebih gelap, tebal). Tabel selalu
dibungkus wadah `overflow-x:auto` — halaman tidak boleh menggeser horizontal.

### Bar dan meter
`.bar-track` (jalur abu) + `.bar-fill` (isi berwarna). Warna isi menyala jadi
`--warning` bila melewati ~85% sebagai isyarat kapasitas hampir penuh.

## 6. Layout

- Kerangka: grid dua kolom — sidebar 236px + konten, dengan topbar 64px
  menempel di atas.
- Lebar konten maksimum 1760px.
- Grid utama: `.kpi-grid` (4 kolom), `.grid-2` (1.6fr + 1fr), `.grid-3`,
  `.analytics-grid` (2 kolom), `.dir-grid`/`.report-grid` (3 kolom).

### Breakpoint

| Lebar | Perubahan |
|-------|-----------|
| ≤1500px | KPI 4→2 kolom, dermaga 6→3 kolom |
| ≤1400px | Grid dua/tiga kolom ditumpuk; direktori jadi 2 kolom |
| ≤1240px | Pencarian dan chip cuaca disembunyikan dari topbar |
| ≤1024px | Sidebar jadi strip horizontal; jam dan identitas pengguna disembunyikan |
| ≤640px | Semua grid satu kolom; panel copilot layar penuh |

> Seluruh breakpoint berada di `responsive.css` yang **wajib dimuat terakhir**.
> Aturannya bersaing dengan specificity yang sama seperti di `layout.css` dan
> `components.css`, jadi urutan berkaslah yang menentukan pemenang.

## 7. Visualisasi data

- **Warna deret:** `--primary` untuk deret utama, `--accent` untuk pembanding,
  `--success` untuk deret ketiga. `--danger` khusus metrik yang buruk bila
  naik (keterlambatan).
- **Garis kisi** `#F1F5F8`, label sumbu 9.5px `--text-low` — kisi tidak boleh
  lebih menonjol daripada data.
- **Legenda** di bawah grafik, hanya muncul bila deret lebih dari satu.
- **Heatmap** menginterpolasi `#F1F5F8` → `--primary`. Satu skala, tanpa
  pelangi.
- **Peta pelabuhan** memakai warna status yang sama dengan badge, sehingga
  titik hijau di peta dan badge hijau di tabel berarti hal yang sama.

## 8. Gerak

Hanya tiga:

1. `pulse` 1.8 detik pada titik LIVE — menandakan data langsung.
2. Denyut lingkaran pada titik kapal — menandakan posisi terkini.
3. Transisi 0.15–0.25 detik untuk hover, toast, dan panel geser.

Tidak ada animasi masuk pada kartu, tidak ada parallax, tidak ada grafik yang
beranimasi saat dimuat.

## 9. Aksesibilitas

- Setiap ikon dekoratif memakai `aria-hidden="true"`; setiap kontrol ikon
  memiliki `aria-label`.
- Navigasi memakai `<a>` dengan `aria-current="page"` pada halaman aktif.
- Tombol dwi-status memakai `aria-pressed`.
- Toast memakai `role="status"` dan `aria-live="polite"`.
- Bahasa dokumen `lang="id"`.
- Informasi tidak pernah disampaikan lewat warna saja — badge selalu berisi
  teks status, peta selalu punya legenda.
