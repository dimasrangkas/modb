# MEMORY.md · Catatan Keputusan PMS

Konteks yang tidak terbaca dari kode: keputusan apa yang diambil, kenapa, dan
apa yang sudah pernah salah. Dibaca di awal sesi kerja berikutnya.

Terakhir diperbarui: **12 Agustus 2026**

---

## 1. Identitas produk

| Hal | Nilai |
|-----|-------|
| Nama | Port Management System |
| Akronim | PMS |
| Namespace JS | `window.PMS` |
| Institusi | Kementerian Kelautan dan Perikanan Republik Indonesia |
| Nama folder repositori | `modb` — **sengaja dibiarkan** |

### Riwayat penamaan

Aplikasi ini berganti nama dua kali:

1. **MODB · Marine Operation Database** — nama awal.
2. **PODB · Port Operation Dashboard** — penggantian pertama.
3. **PMS · Port Management System** — nama sekarang.

Nama folder tetap `modb` atas permintaan eksplisit pengguna. Tidak ada kode
yang menyebut nama folder (semua path relatif), jadi keduanya memang tidak
terikat. **Jangan menawarkan penggantian nama folder lagi** — sudah ditanyakan
dan jawabannya tetap `modb`.

Identitas produk terpusat di `APP` pada `data.js`. Mengubah nama cukup di sana
untuk topbar, copilot dan footer; sisanya adalah `<title>` tiap halaman dan
banner komentar.

## 2. Keputusan arsitektur

### MPA, bukan SPA (12 Agustus 2026)
Awalnya aplikasi berupa satu `index.html` dengan sepuluh `<section>` yang
disembunyikan dan router JavaScript. Atas permintaan pengguna, dipecah menjadi
sepuluh berkas HTML terpisah.

Konsekuensi yang sudah ditangani:
- Kerangka (topbar, sidebar, copilot, toast, footer) **dirender JavaScript**,
  bukan disalin sepuluh kali. Ini keputusan sadar: menyalin markup topbar ke
  sepuluh berkas berarti sepuluh tempat yang harus diubah setiap kali.
- Navigasi berubah dari `<button>` + router menjadi `<a href>` antar berkas.
- Pemasangan event harus tahan elemen tak ada → helper `on()`.
- Pencarian global tidak bisa lagi memindah halaman di tempat; sekarang
  mengarahkan ke `vessel-board.html?q=…`.
- Pemilihan pelabuhan tidak lagi bertahan otomatis; disimpan lewat `store`.

### Namespace global, bukan ES module
Persyaratan: halaman harus bisa dibuka dengan klik ganda (`file://`). ES module
diblokir CORS di sana. Konversi ke `import`/`export` hanya menyentuh baris
pertama dan terakhir tiap berkas bila kelak disajikan lewat HTTP.

### CSS dipecah empat, `responsive.css` terakhir
Ini bukan preferensi gaya melainkan keharusan teknis — aturan responsif
memakai specificity yang sama dengan `components.css`, jadi urutan berkas yang
menentukan. **Ini jebakan paling berbahaya di repositori ini** karena gagalnya
diam-diam.

### Data tunggal + blok `DERIVED`
Versi awal memakai `Math.random()` di banyak tempat, sehingga KPI "9/12
dermaga" bisa bertentangan dengan kartu dermaga di halaman Resources. Sekarang
semua yang bisa dihitung diturunkan dari `BERTHS` + `VESSELS` di satu tempat.

### Chart.js hanya di dua halaman
`analytics.html` dan `executive.html`. Halaman lain tidak memuatnya sama
sekali; kode dijaga `typeof Chart === 'undefined'`.

## 3. Keputusan data

### Entitas nyata, angka simulasi
Nama pelabuhan (Tanjung Priok, Tanjung Perak, Belawan, …), terminal (JICT,
NPCT1, TPK Koja, Nusantara Pura, IKT), operator (PELNI, Temas, SPIL, Meratus,
Tanto, Samudera, Djakarta Lloyd, Pertamina PIS, Bahtera Adhiguna, Atosim),
kapal (KM Kelud, KM Dobonsolo, MT Gamsunoro, …), dan instansi (KSOP, Bea Cukai,
BMKG, VTS, Pelindo) semuanya nyata.

**Nomor IMO, volume, tarif, dan seluruh angka adalah simulasi.** Keterangan ini
ada di footer setiap halaman dan tidak boleh dihapus. Jangan menyajikan angka
di aplikasi ini seolah data resmi.

### KPI memakai istilah lapangan
BOR, YOR, BSH, BCH, waiting time, turn round time — istilah pelaporan yang
memang dipakai Pelindo, bukan terjemahan baru. Ini permintaan implisit dari
arahan "data asli Indonesia".

### Konsistensi berhitung
Dermaga: 12 total → 9 terpakai, 1 perawatan (NPCT1-02), 2 tersedia → BOR 75,0%.
Angka ini muncul di KPI Dashboard, kartu dermaga di Resources, dan peta —
ketiganya dari `DERIVED`, bukan ditulis tiga kali.

## 4. Keputusan tampilan

### Font tunggal Plus Jakarta Sans
Menggantikan IBM Plex Sans + Inter + IBM Plex Mono. Karena tidak ada font
monospace lagi, angka teknis dibedakan lewat `font-variant-numeric: tabular-nums`
pada daftar selector di `base.css`. **Komponen berangka baru harus ditambahkan
ke daftar itu.**

### Lambang KKP adalah render bergaya
`assets/img/logo-kkp.svg` bukan reproduksi persis lambang resmi. Dibuat sebagai
SVG agar berkas tetap mandiri tanpa aset eksternal. Penggantian dengan lambang
resmi = menimpa satu berkas, tanpa mengubah kode.

Ini sudah disampaikan ke pengguna. Jangan mengklaim logo ini resmi.

### Judul halaman Dashboard
Pernah berbunyi sama dengan nama aplikasi. Sejak pemecahan MPA, `h1`-nya
menjadi "Dashboard" — nama aplikasi sudah tampil di topbar, jadi pengulangan
tidak perlu.

## 5. Bug yang pernah terjadi

| Bug | Akibat | Perbaikan |
|-----|--------|-----------|
| `join('\\n')` dan `/\\s+/` di ekspor CSV | Garis miring terbalik harfiah; CSV keluar satu baris | Ditulis benar sebagai `'\n'` dan `/\s+/` |
| CSV tanpa BOM | Nama kapal rusak di Excel | Ditambah BOM UTF-8 |
| `Math.random()` pada data operasional | Angka berubah tiap reload, bertentangan antar halaman | Diganti data tetap + `DERIVED` |
| Chart.js pada canvas `display:none` | Grafik berukuran nol | Dulu ditunda sampai halaman dibuka; sejak MPA tidak relevan |
| Pemilih pelabuhan & pencarian global tidak berfungsi | Kontrol mati di UI | Dipasangkan listener |
| `toggleAttribute('aria-current', true)` | Menghasilkan `aria-current=""`, CSS menargetkan `="page"` | Ditulis eksplisit dengan `setAttribute` |

## 6. Catatan lingkungan kerja

- Shell adalah **zsh**: ekspansi variabel tanpa kutip **tidak** dipecah jadi
  argumen terpisah. `sed ... $FILES` gagal; tulis daftar berkasnya langsung
  atau pakai `${=FILES}`.
- Chrome headless di macOS ini bisa jadi tidak stabil setelah proses Chrome
  dimatikan paksa (`pkill`) — muncul assertion `_NSCGSTransaction` dan output
  kosong. Pakai direktori profil baru, atau andalkan pemeriksaan statis.
- Tidak ada test runner. Verifikasi memakai `node --check` plus skrip Python
  sekali pakai yang memeriksa kecocokan NAV ↔ berkas ↔ `data-page` ↔ selector
  builder. Pola skripnya ada di `IMPLEMENTATION.md` bagian 8.

## 7. Preferensi cara kerja pengguna

- Bahasa komunikasi: Indonesia.
- Pengguna kadang mengedit berkas sendiri di IDE di sela pekerjaan (pernah
  melakukan find/replace sebagian). **Periksa keadaan berkas sebelum menimpa.**
- Commit hanya bila diminta. Sampai catatan ini ditulis, semua pekerjaan
  ditinggal di working tree.
- Pengguna meminta rename dilakukan "di kode saja" — jangan meluas ke nama
  folder atau hal di luar yang diminta.
