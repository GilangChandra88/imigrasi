/**
 * SPBY — Form Hub Pembayaran Perjalanan Dinas
 * =============================================
 * SPBY bukan surat tunggal — ini adalah "form input" yang menjadi
 * sumber data bagi 7 dokumen keuangan sekaligus.
 * Setelah SPBY diisi, 7 surat turunan dibuat otomatis.
 */
export const definition = {
  id: 'spby',
  kode: 'SPBY',
  nama: 'SPBY (Form Hub)',
  kategori: 'Keuangan',
  deskripsi: 'Form Surat Permintaan Bayar yang menjadi sumber data bagi 7 dokumen keuangan: Nota Dinas, SPB, Rincian SPBy, Rincian Perjalanan, SPTJM, Nominatif, dan Kwitansi.',
  icon: '💰',
  warna: '#f59e0b',
  status: 'active',
  variables: [
    { key: 'nomor_sp_ref',     label: 'No. SP Referensi',       type: 'text',     required: true,  source: 'linked' },
    { key: 'nomor_spd_ref',    label: 'No. SPD Referensi',      type: 'text',     required: true,  source: 'linked' },
    { key: 'pegawai_list',     label: 'Daftar Pegawai',         type: 'multi_pegawai', required: true, source: 'linked' },
    { key: 'tujuan',           label: 'Tujuan',                 type: 'text',     required: true,  source: 'linked' },
    { key: 'tanggal_mulai',    label: 'Tanggal Mulai',          type: 'date',     required: true,  source: 'linked' },
    { key: 'tanggal_selesai',  label: 'Tanggal Selesai',        type: 'date',     required: true,  source: 'linked' },
    { key: 'total_hari',       label: 'Total Hari',             type: 'number',   required: true,  source: 'auto'   },
    { key: 'biaya_transport',  label: 'Biaya Transport (Rp)',   type: 'currency', required: true,  source: 'input'  },
    { key: 'biaya_hotel',      label: 'Biaya Hotel (Rp)',       type: 'currency', required: false, source: 'input'  },
    { key: 'uang_harian',      label: 'Uang Harian (Rp/hari)', type: 'currency', required: true,  source: 'input'  },
    { key: 'total_biaya',      label: 'Total Biaya (Rp)',       type: 'currency', required: true,  source: 'auto'   },
    { key: 'mak',              label: 'Kode MAK/Anggaran',     type: 'text',     required: true,  source: 'input'  },
    { key: 'pejabat_ppk',     label: 'Pejabat PPK',            type: 'pegawai',  required: true,  source: 'pegawai'},
    { key: 'bendahara',        label: 'Bendahara Pengeluaran', type: 'pegawai',  required: true,  source: 'pegawai'},
    { key: 'tanggal_spby',    label: 'Tanggal SPBY',           type: 'date',     required: true,  source: 'auto'   },
  ],
  connections: [
    { targetSuratId: 'nota-dinas',              type: 'triggers', label: '→ Nota Dinas',         variableMapping: {} },
    { targetSuratId: 'surat-perintah-bayar',    type: 'triggers', label: '→ SPB',                variableMapping: {} },
    { targetSuratId: 'rincian-spby',            type: 'triggers', label: '→ Rincian SPBy',       variableMapping: {} },
    { targetSuratId: 'rincian-perjalanan-tugas',type: 'triggers', label: '→ Rincian Perjalanan', variableMapping: {} },
    { targetSuratId: 'sptjm-pelaksana',         type: 'triggers', label: '→ SPTJM',              variableMapping: {} },
    { targetSuratId: 'nominatif',               type: 'triggers', label: '→ Nominatif',          variableMapping: {} },
    { targetSuratId: 'kwitansi',                type: 'triggers', label: '→ Kwitansi',           variableMapping: {} },
  ],
  nodePosition: { x: 560, y: 220 },
};
