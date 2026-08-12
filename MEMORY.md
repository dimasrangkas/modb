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
| Nama folder repositori | `modb` |

## 1. Keputusan arsitektur

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

## 2. Keputusan data

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

## 3. Keputusan tampilan

### Font tunggal Plus Jakarta Sans
Menggantikan IBM Plex Sans + Inter + IBM Plex Mono. Karena tidak ada font
monospace lagi, angka teknis dibedakan lewat `font-variant-numeric: tabular-nums`
pada daftar selector di `base.css`. **Komponen berangka baru harus ditambahkan
ke daftar itu.**

### Lambang KKP adalah render bergaya
`assets/img/logo-kkp.svg` bukan reproduksi persis lambang resmi. Dibuat sebagai
SVG agar berkas tetap mandiri tanpa aset eksternal. Penggantian dengan lambang
resmi = menimpa satu berkas, tanpa mengubah kode.

## 4. Bug yang pernah terjadi

| Bug | Akibat | Perbaikan |
|-----|--------|-----------|
| `join('\\n')` dan `/\\s+/` di ekspor CSV | Garis miring terbalik harfiah; CSV keluar satu baris | Ditulis benar sebagai `'\n'` dan `/\s+/` |
| CSV tanpa BOM | Nama kapal rusak di Excel | Ditambah BOM UTF-8 |
| `Math.random()` pada data operasional | Angka berubah tiap reload, bertentangan antar halaman | Diganti data tetap + `DERIVED` |
| Chart.js pada canvas `display:none` | Grafik berukuran nol | Dulu ditunda sampai halaman dibuka; sejak MPA tidak relevan |
| Pemilih pelabuhan & pencarian global tidak berfungsi | Kontrol mati di UI | Dipasangkan listener |
| `toggleAttribute('aria-current', true)` | Menghasilkan `aria-current=""`, CSS menargetkan `="page"` | Ditulis eksplisit dengan `setAttribute` |

## 5. Catatan lingkungan kerja

- Shell adalah **zsh**: ekspansi variabel tanpa kutip **tidak** dipecah jadi
  argumen terpisah. `sed ... $FILES` gagal; tulis daftar berkasnya langsung
  atau pakai `${=FILES}`.
- Chrome headless di macOS ini bisa jadi tidak stabil setelah proses Chrome
  dimatikan paksa (`pkill`) — muncul assertion `_NSCGSTransaction` dan output
  kosong. Pakai direktori profil baru, atau andalkan pemeriksaan statis.
- Tidak ada test runner. Verifikasi memakai `node --check` plus skrip Python
  sekali pakai yang memeriksa kecocokan NAV ↔ berkas ↔ `data-page` ↔ selector
  builder. Pola skripnya ada di `IMPLEMENTATION.md` bagian 8.

## 6. Preferensi cara kerja pengguna

- Bahasa komunikasi: Indonesia.
- Pengguna kadang mengedit berkas sendiri di IDE di sela pekerjaan (pernah
  melakukan find/replace sebagian). **Periksa keadaan berkas sebelum menimpa.**
