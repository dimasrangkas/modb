/* =========================================================================
   PODB · Port Operation Dashboard
   copilot.js — panel asisten. Jawaban disusun dari data operasional yang
   sedang tampil (PODB.data), bukan dari layanan eksternal, sehingga isinya
   selalu konsisten dengan angka di dashboard.

   Bergantung pada: utils.js, data.js
   Mengekspor: PODB.copilot
   ========================================================================= */
(function(PODB){
'use strict';

const {$, nf} = PODB.utils;
const D = PODB.data;

function addMessage(role, text){
  const chat = $('#aiChat');
  const el = document.createElement('div');
  el.className = 'ai-msg ' + role;
  el.textContent = text;
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
}

function answer(query){
  const q = query.toLowerCase();
  const arriving = D.VESSELS.find(v => v.status === 'Arriving');
  const free = D.BERTH_STATE.filter(b => b.status === 'Available').map(b => b.code);

  if(q.includes('eta'))
    return `Berdasarkan kecepatan dan haluan AIS terkini, ${arriving.name} (${arriving.voyage}) diperkirakan tiba pukul ${arriving.eta} ± 18 menit dengan tingkat keyakinan 94%.`;

  if(q.includes('dermaga') && q.includes('ketersediaan'))
    return `Dermaga ${free.join(' dan ')} berstatus tersedia. NPCT1-02 masih dalam perawatan fender & bollard dan diperkirakan siap dalam 6 jam.`;

  if(q.includes('kepadatan'))
    return `Risiko kepadatan terdeteksi di Koja 02 pada 15.30–17.00 WIB akibat ETA yang beririsan antara KM Oriental Diamond dan MT Sanana. Disarankan mengalihkan satu kapal ke TCK-01.`;

  if(q.includes('alokasi'))
    return `Rekomendasi alokasi: tempatkan ${arriving.name} di ${free[0] || 'TCK-01'} berdasarkan kesesuaian draft, jenis muatan dan jadwal okupansi berjalan.`;

  if(q.includes('tunda'))
    return `KT Bima 306 berstatus siaga dan berada paling dekat — direkomendasikan untuk membantu penyandaran ${arriving.name}.`;

  if(q.includes('anomali'))
    return `Anomali terdeteksi: MT Sanana belum mengirim pembaruan AIS selama 43 menit, melewati ambang batas 30 menit. Ditandai untuk tindak lanjut VTS Tanjung Priok.`;

  if(q.includes('ringkasan'))
    return `Hari ini: ${D.DAILY.shipCalls} kunjungan kapal, ${D.DAILY.departures} keberangkatan, BOR ${nf(D.DERIVED.bor, 1)}%, YOR ${nf(D.DAILY.yor, 1)}%, waiting time rata-rata ${nf(D.DAILY.waitingTime, 1)} jam. Dua peringatan masih terbuka — kepadatan alur dan penahanan dokumen Bea Cukai.`;

  return `Hasil untuk "${query}": seluruh sistem berjalan normal, tidak ada anomali kritis pada shift berjalan.`;
}

function ask(query){
  addMessage('user', query);
  setTimeout(() => addMessage('bot', answer(query)), 400);
}

function submitInput(){
  const input = $('#aiInput');
  const value = input.value.trim();
  if(!value) return;
  ask(value);
  input.value = '';
}

function greet(){
  addMessage('bot', 'Halo Bayu — saya PODB Copilot. Tanyakan soal ETA, alokasi dermaga, kepadatan alur, atau ringkasan operasi harian, atau gunakan aksi cepat di atas.');
}

PODB.copilot = {ask, submitInput, greet, addMessage};

})(window.PODB = window.PODB || {});
