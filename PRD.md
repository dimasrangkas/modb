# PRD · PMS Port Management System

**Status:** Prototipe demonstrasi (data simulasi)
**Pemilik produk:** Kementerian Kelautan dan Perikanan Republik Indonesia
**Versi dokumen:** 1.0 · Agustus 2026

---

## 1. Latar belakang

Operasional pelabuhan Indonesia melibatkan banyak pihak yang datanya tersebar:
otoritas pelabuhan (Pelindo), syahbandar (KSOP), kepabeanan (Bea Cukai),
pemanduan, penyedia kapal tunda, perusahaan pelayaran, dan penyedia data cuaca
(BMKG). Petugas operasional terminal saat ini harus membuka beberapa sistem
terpisah untuk menjawab pertanyaan sederhana seperti "dermaga mana yang kosong
tiga jam lagi" atau "kapal mana yang tertahan dokumen".

PMS menyatukan gambaran operasional itu dalam satu antarmuka: satu layar untuk
kondisi terkini, satu papan untuk seluruh pergerakan kapal, dan halaman
terpisah untuk sumber daya, analitik, komunikasi dan pelaporan.

## 2. Tujuan produk

| # | Tujuan | Ukuran keberhasilan |
|---|--------|---------------------|
| G1 | Memberi ikhtisar operasional dalam satu layar | Petugas dapat menyebutkan BOR, jumlah kunjungan kapal, dan peringatan aktif tanpa berpindah halaman |
| G2 | Menghilangkan angka yang saling bertentangan | Satu nilai (mis. dermaga terpakai) hanya dihitung di satu tempat dan konsisten di semua halaman |
| G3 | Mempercepat penelusuran satu kapal | Dari halaman mana pun, satu kali ketik + Enter membuka Vessel Board yang sudah terfilter |
| G4 | Memakai istilah kerja yang sudah dipakai di lapangan | KPI menggunakan BOR/YOR/BSH/BCH, bukan istilah terjemahan baru |
| G5 | Dapat dijalankan tanpa infrastruktur | Cukup dibuka di browser, tanpa server, tanpa proses build |

## 3. Pengguna sasaran

| Peran | Kebutuhan utama | Halaman utama |
|-------|-----------------|---------------|
| **Supervisor Operasi Terminal** (pengguna utama) | Kondisi terkini, peringatan, alokasi dermaga | Dashboard, Vessel Board |
| **Petugas Perencana Dermaga** | Okupansi dermaga per jam, kesiapan crane dan kapal tunda | Resources, Analytics |
| **Petugas Pelayanan Kapal** | Jadwal ETA/ETD, penugasan pandu dan tunda | Vessel Board |
| **Manajemen Pelabuhan** | Kinerja bulanan, pendapatan, arus barang | Executive |
| **Petugas Data & Pelaporan** | Ekspor laporan periodik | Reports |

## 4. Ruang lingkup

### Termasuk (versi ini)

- Sepuluh halaman sesuai daftar di bagian 5.
- Data operasional simulasi untuk Pelabuhan Tanjung Priok, dengan konteks
  delapan pelabuhan pada jaringan Pelindo dan BP Batam.
- Ekspor CSV untuk tiga jenis laporan.
- Panel asisten (copilot) berbasis aturan yang menjawab dari data yang sedang
  ditampilkan.
- Antarmuka responsif hingga lebar ponsel.

### Tidak termasuk (versi ini)

- Autentikasi, otorisasi, dan manajemen pengguna.
- Backend, basis data, dan integrasi nyata ke AIS/VTS/Inaportnet.
- Penulisan data (semua tampilan bersifat baca saja).
- Ekspor PDF dan Excel sungguhan (tombolnya ada, hasilnya masih notifikasi).
- Data operasional per pelabuhan selain Tanjung Priok — pemilih pelabuhan baru
  mengubah konteks dan cuaca, belum mengubah detail dermaga dan kapal.
- Riwayat historis di luar rentang yang sudah disiapkan (24 jam, 7 hari, 14
  hari, 12 bulan).

## 5. Kebutuhan per halaman

### 5.1 Dashboard (`index.html`)

Ikhtisar kondisi terkini.

- **F-1.1** Menampilkan 8 kartu KPI: kunjungan kapal, keberangkatan, arus peti
  kemas, arus barang, dermaga terpakai, YOR, BSH, dan waiting time rata-rata.
- **F-1.2** Nilai "dermaga terpakai" dan BOR **wajib** dihitung dari data
  dermaga, bukan ditulis manual.
- **F-1.3** Peta GIS pelabuhan menampilkan posisi dermaga beserta statusnya dan
  titik kapal, dengan lapisan yang bisa dinyala-matikan (dermaga, kapal, angin,
  alur).
- **F-1.4** Kartu cuaca dan pasang surut mengikuti format BMKG/Pushidrosal.
- **F-1.5** Daftar peringatan operasional dengan tiga tingkat keparahan.
- **F-1.6** Timeline ETA/ETD 24 jam untuk kapal yang belum berangkat.
- **F-1.7** Jadwal hari ini, ringkasan muatan, dan ketersediaan sumber daya.

### 5.2 Vessel Board (`vessel-board.html`)

Papan seluruh pergerakan kapal.

- **F-2.1** Tabel 16 kolom: kapal, voyage, operator, IMO, asal, tujuan, ETA,
  ETD, ATA, ATD, dermaga, pandu, tunda, muatan, bea cukai, status.
- **F-2.2** Filter status: semua, kedatangan, sandar, bongkar/muat, berangkat,
  tertunda.
- **F-2.3** Pencarian berdasarkan nama kapal, nomor IMO, atau voyage.
- **F-2.4** Tampilan alternatif berupa timeline.
- **F-2.5** Menerima kata kunci dari pencarian global lewat parameter `?q=`.
- **F-2.6** Menampilkan pesan yang jelas bila hasil filter kosong.

### 5.3 Resources (`resources.html`)

- **F-3.1** Kartu 12 dermaga dengan status: terpakai, perawatan, tersedia, dan
  nama kapal yang sedang sandar.
- **F-3.2** Utilisasi container crane dan RTG, termasuk unit yang sedang
  dirawat.
- **F-3.3** Status kapal tunda dan kapal pandu beserta penugasannya.
- **F-3.4** Okupansi gudang, lapangan penumpukan (dengan visualisasi petak),
  dan terminal penumpang.

### 5.4 Analytics (`analytics.html`)

- **F-4.1** Panel wawasan prediktif (empat butir).
- **F-4.2** Tujuh grafik: lalu lintas kapal, arus barang, utilisasi dermaga,
  tren keterlambatan, jam puncak, waiting time, efisiensi sumber daya.
- **F-4.3** Heatmap okupansi 12 dermaga × 24 jam.

### 5.5 Executive (`executive.html`)

- **F-5.1** Enam KPI bulanan termasuk pendapatan dalam Rupiah.
- **F-5.2** Grafik gabungan pendapatan dan kunjungan kapal 12 bulan.
- **F-5.3** Ringkasan naratif tiga paragraf.

### 5.6 Messages (`messages.html`)

- **F-6.1** Arus pesan dari delapan sumber: AIS, VTS, perusahaan pelayaran,
  Bea Cukai, KSOP, pemanduan, kapal tunda, sistem.
- **F-6.2** Filter per sumber.
- **F-6.3** Setiap pesan menampilkan status parsing dan status validasi.

### 5.7 Reports (`reports.html`)

- **F-7.1** Tujuh jenis laporan dengan tombol PDF, Excel, CSV.
- **F-7.2** Ekspor CSV berfungsi nyata untuk laporan kunjungan kapal, sandar
  dermaga, dan arus barang.
- **F-7.3** Berkas CSV harus terbaca benar di Excel untuk nama kapal berhuruf
  non-ASCII.

### 5.8 Direktori (`shipping-lines.html`, `vessels.html`, `ports.html`)

- **F-8.1** Direktori 10 perusahaan pelayaran dengan jumlah kapal aktif,
  ketepatan waktu, dan port call 30 hari.
- **F-8.2** Registri kapal: IMO, jenis, bendera, GT, LOA, operator, status.
- **F-8.3** Jaringan 8 pelabuhan dengan jumlah dermaga, kapal, dan BOR.

### 5.9 Lintas halaman

- **F-9.1** Topbar, sidebar, copilot, dan footer identik di seluruh halaman.
- **F-9.2** Item sidebar halaman aktif ditandai jelas.
- **F-9.3** Pemilih pelabuhan mempertahankan pilihan saat berpindah halaman
  bila penyimpanan browser tersedia.
- **F-9.4** Jam menampilkan waktu WIB dan diperbarui tiap detik.
- **F-9.5** Copilot dapat dibuka dari halaman mana pun dan menjawab dari data
  yang sedang dimuat.

## 6. Kebutuhan non-fungsional

| Kode | Kebutuhan |
|------|-----------|
| NF-1 | Berjalan tanpa server — dapat dibuka lewat `file://` |
| NF-2 | Tanpa proses build dan tanpa dependensi npm |
| NF-3 | Satu-satunya pustaka pihak ketiga adalah Chart.js, hanya di halaman yang memakai grafik |
| NF-4 | Tampilan menggunakan font Plus Jakarta Sans |
| NF-5 | Angka diformat gaya Indonesia (`18.420`, `1,4`) |
| NF-6 | Antarmuka tetap terbaca hingga lebar 360 px |
| NF-7 | Navigasi dapat diakses keyboard; status aktif dan tekan diumumkan lewat `aria-current` dan `aria-pressed` |
| NF-8 | Tampilan harus identik setiap kali dimuat ulang — tidak ada angka acak |
| NF-9 | Seluruh teks yang dihasilkan dari data harus di-escape sebelum masuk HTML |

## 7. Asumsi dan batasan

- Data yang ditampilkan adalah simulasi. Nomor IMO dan angka keuangan tidak
  merujuk catatan resmi mana pun.
- Lambang KKP yang dipakai adalah render bergaya, bukan reproduksi lambang
  resmi. Penggantian dilakukan dengan menimpa satu berkas.
- Chart.js dimuat dari CDN, sehingga grafik memerlukan koneksi internet.
  Halaman selain Analytics dan Executive berfungsi penuh secara luring.
- Pemilihan pelabuhan disimpan di `localStorage`. Bila browser memblokirnya
  pada `file://`, pilihan hanya bertahan dalam satu halaman.

## 8. Arah pengembangan berikutnya

1. Data operasional per pelabuhan, bukan hanya Tanjung Priok.
2. Integrasi sumber data nyata (Inaportnet, AIS, BMKG) menggantikan `data.js`.
3. Ekspor PDF dan Excel sungguhan.
4. Autentikasi dan pembedaan tampilan menurut peran.
5. Pembaruan langsung (WebSocket) menggantikan angka statis.
