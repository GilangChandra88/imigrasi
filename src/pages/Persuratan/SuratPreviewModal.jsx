import React, { useState, useEffect } from 'react';
import { FaTimes, FaPrint, FaDownload, FaSpinner } from 'react-icons/fa';

/**
 * Komponen modal untuk mem-preview bagaimana hasil akhir dokumen
 * akan terlihat jika di-generate oleh sistem menggunakan dummy data.
 */
export default function SuratPreviewModal({ surat, onClose }) {
  const [loading, setLoading] = useState(true);

  // Simulasi loading sebentar agar terkesan sedang generate dokumen
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  // Bikin dummy data berdasarkan tipe variabel (atau pakai data asli jika ada)
  const dummyData = { ...surat.instanceData };
  surat.variables?.forEach(v => {
    if (dummyData[v.key] !== undefined && dummyData[v.key] !== '') return; // sudah ada data asli
    
    if (v.type === 'text') dummyData[v.key] = 'XXXXXXXXXXXXXXXXX';
    if (v.type === 'textarea') dummyData[v.key] = 'Jl. Contoh Alamat Dummy No. 123, Kel. Simulasi, Kec. Testing, Kota Jakarta';
    if (v.type === 'date') dummyData[v.key] = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    if (v.type === 'pegawai') dummyData[v.key] = 'Dr. Nama Pegawai Dummy, M.Si.\nNIP. 19800101 200501 1 001';
    if (v.type === 'number' || v.key.includes('anggaran')) dummyData[v.key] = 'Rp 1.500.000,-';
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-8">
      <div className="bg-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Toolbar Header */}
        <div className="bg-white border-b border-slate-300 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xl">{surat.icon}</span>
            <div>
              <h3 className="font-bold text-slate-800 text-sm leading-none">{surat.nama}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">{surat.kode} • Preview Mode</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 transition-colors">
              <FaDownload size={10} /> PDF
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-semibold text-white transition-colors">
              <FaPrint size={10} /> Print
            </button>
            <div className="w-px h-5 bg-slate-300 mx-1"></div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors">
              <FaTimes size={14} />
            </button>
          </div>
        </div>

        {/* Canvas Area (Grey background) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center text-slate-400">
              <FaSpinner className="animate-spin text-3xl mb-4 text-indigo-500" />
              <p className="text-sm font-semibold">Membuat preview dokumen...</p>
            </div>
          ) : (
            /* Kertas A4 */
            <div className="bg-white shadow-lg w-full max-w-[210mm] min-h-[297mm] p-[25mm] font-serif text-[11pt] leading-normal text-black relative">
              
              {/* Watermark "DRAFT" */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <span className="text-9xl font-black -rotate-45">PREVIEW</span>
              </div>

              {/* KOP SURAT (Konsisten untuk semua dokumen) */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-3">
                  {/* Logo Kemenimipas (Placeholder) */}
                  <div className="w-[85px] h-[85px] shrink-0">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Kementerian_Imigrasi_dan_Pemasyarakatan_Republik_Indonesia.svg/1024px-Kementerian_Imigrasi_dan_Pemasyarakatan_Republik_Indonesia.svg.png" 
                      alt="Logo" 
                      className="w-full h-full object-contain grayscale opacity-80 mix-blend-multiply" 
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                    <div className="hidden w-full h-full bg-slate-100 rounded-full border border-slate-300 items-center justify-center">
                      <span className="text-[9px] text-slate-400 font-sans text-center font-bold leading-tight">LOGO<br/>KEMEN<br/>IMIPAS</span>
                    </div>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="font-bold text-sm uppercase leading-snug">Kementerian Imigrasi dan Pemasyarakatan Republik Indonesia</p>
                    <p className="font-bold text-sm uppercase leading-snug">Direktorat Jenderal Imigrasi</p>
                    <p className="font-bold text-sm uppercase leading-snug">Kantor Wilayah Direktorat Jenderal Imigrasi Bali</p>
                    <p className="font-bold text-lg uppercase leading-tight tracking-wide mb-1">Kantor Imigrasi Kelas II TPI Singaraja</p>
                    <p className="text-[10px] leading-tight">Jl. Raya Singaraja Seririt, Pemaron, Buleleng, Bali. Telepon ( 0362 ) 32174</p>
                    <p className="text-[10px] leading-tight">Laman: www.singaraja.imigrasi.go.id Pos-el: kanim_singaraja@imigrasi.go.id</p>
                  </div>
                  {/* Spacer kanan supaya teks center persis di tengah kertas meski ada logo di kiri */}
                  <div className="w-[85px] h-[85px] shrink-0"></div>
                </div>
                {/* Garis Ganda Kop Surat */}
                <div className="border-b-[3px] border-black mb-[2px]"></div>
                <div className="border-b border-black"></div>
              </div>

              {/* --- KONTEN SURAT --- */}
              {surat.id === 'surat-perintah' ? (
                <>
                  <div className="mb-6 text-justify leading-relaxed">
                    
                    <div className="text-center mb-8">
                      <p className="font-bold uppercase underline">SURAT PERINTAH</p>
                      <p className="uppercase">NOMOR : {dummyData['nomor_sp'] || 'WIM.20.IMI.3.UM.02.07-350'}</p>
                    </div>

                    <table className="w-full mb-6">
                      <tbody>
                        <tr>
                          <td className="w-24 align-top py-1">Menimbang</td>
                          <td className="w-4 align-top py-1">:</td>
                          <td className="align-top py-1 whitespace-pre-wrap">{dummyData['menimbang'] || 'Bahwa dalam rangka pelaksanaan kegiatan, dipandang perlu dikeluarkan Surat Perintah.'}</td>
                        </tr>
                        <tr>
                          <td className="w-24 align-top py-1">Dasar</td>
                          <td className="w-4 align-top py-1">:</td>
                          <td className="align-top py-1 whitespace-pre-wrap">{dummyData['dasar'] || '1. Surat Sekretaris Jenderal...'}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="text-center font-bold mb-4">MENUGASKAN :</div>

                    <table className="w-full mb-6">
                      <tbody>
                        <tr>
                          <td className="w-24 align-top py-1">Kepada</td>
                          <td className="w-4 align-top py-1">:</td>
                          <td className="align-top py-1">
                            {dummyData['pegawai_list']?.length > 0 ? (
                              dummyData['pegawai_list'].map((pInfo, idx) => {
                                const lines = pInfo.split('\n');
                                const nama = lines[0];
                                const nip = lines[1]?.replace('NIP. ', '') || '-';
                                const pangkat = lines[2]?.replace('Pangkat: ', '') || '-';
                                const jabatan = lines[3]?.replace('Jabatan: ', '') || '-';

                                return (
                                  <div key={idx} className="flex gap-2 mb-4">
                                    <div className="w-4">{idx + 1}</div>
                                    <table className="flex-1">
                                      <tbody>
                                        <tr><td className="w-24 py-0.5">Nama</td><td className="w-4">:</td><td className="font-bold">{nama}</td></tr>
                                        <tr><td className="py-0.5">NIP</td><td>:</td><td>{nip}</td></tr>
                                        <tr><td className="py-0.5">Pangkat / Gol.</td><td>:</td><td>{pangkat}</td></tr>
                                        <tr><td className="py-0.5">Jabatan</td><td>:</td><td>{jabatan}</td></tr>
                                      </tbody>
                                    </table>
                                  </div>
                                )
                              })
                            ) : (
                              <div className="text-slate-400 italic">-- Belum ada pegawai yang dipilih --</div>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="w-24 align-top py-1">Untuk</td>
                          <td className="w-4 align-top py-1">:</td>
                          <td className="align-top py-1">
                            <ol className="list-decimal pl-4 space-y-1">
                              <li>{dummyData['kegiatan_poin_1'] || 'Mengikuti kegiatan...'}</li>
                              <li>Selama Melaksanakan kegiatan tersebut, yang bersangkutan dibebaskan dari tugas dinas sehari-hari;</li>
                              <li>Surat tugas ini berlaku sampai dengan selesainya kegiatan; dan</li>
                              <li>Melaporkan hasil kegiatan tesebut kepada Kepala Kantor Imigrasi Kelas II TPI Singaraja.</li>
                            </ol>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Tanda Tangan SP */}
                  <div className="flex justify-end mt-16 text-center">
                    <div className="w-64">
                      <p className="text-left mb-2">
                        {dummyData['tempat_terbit'] || 'Singaraja'}, {dummyData['tanggal_sp'] || '24 Agustus 2026'}<br/>
                        Kepala,
                      </p>
                      <div className="h-20 bg-slate-100 border border-slate-300 flex items-center justify-center mb-2 mx-auto">
                        <span className="text-xs text-slate-400">QR / BSrE</span>
                      </div>
                      {(() => {
                        const ttdVar = surat.variables?.find(v => v.key === 'pejabat_ttd');
                        if (ttdVar && dummyData[ttdVar.key]) {
                          const lines = dummyData[ttdVar.key].split('\n');
                          return <p className="font-bold">{lines[0]}</p>;
                        }
                        return <p className="font-bold">Anak Agung Gde Kusuma Putra</p>;
                      })()}
                    </div>
                  </div>
                </>
              ) : surat.id === 'surat-perjalanan-dinas' ? (
                <>
                  {/* --- HALAMAN 1 SPD --- */}
                  <div className="text-right mb-4 text-xs font-serif">
                    Lembar ke : I<br/>
                    Kode No. :<br/>
                    Nomor : {dummyData['nomor_spd'] || 'WIM.20.IMI.3.SA.08.01-366'}<br/>
                    2111
                  </div>
                  <div className="text-center font-bold underline text-sm mb-6 uppercase">
                    SURAT PERJALANAN DINAS (SPD)
                  </div>
                  <table className="w-full border-collapse border border-black text-sm mb-8">
                    <tbody>
                      <tr>
                        <td className="border border-black p-2 w-8 text-center align-top">1</td>
                        <td className="border border-black p-2 w-64 align-top">Pejabat Pembuat Komitmen</td>
                        <td className="border border-black p-2 align-top">
                          Kantor Imigrasi Kelas II Singaraja<br/>
                          <span className="font-bold uppercase">{dummyData['ppk'] ? dummyData['ppk'].split('\n')[0] : 'I KADEK DARWIN YANTO'}</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black p-2 text-center align-top">2</td>
                        <td className="border border-black p-2 align-top">Nama/ NIP pegawai yang melaksanakan tugas</td>
                        <td className="border border-black p-2 align-top">
                          <span className="font-bold uppercase">{dummyData['pegawai'] ? dummyData['pegawai'].split('\n')[0] : 'NYOMAN SUDIARSANA'}</span><br/>
                          {dummyData['pegawai'] ? dummyData['pegawai'].split('\n')[1]?.replace('NIP. ', '') : '198007202025211036'}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black p-2 text-center align-top">3</td>
                        <td className="border border-black p-2 align-top">
                          a. Pangkat dan Golongan<br/>
                          b. Jabatan/Instansi<br/>
                          c. Tingkat Biaya Perjalanan Dinas
                        </td>
                        <td className="border border-black p-2 align-top">
                          a. {dummyData['pegawai'] ? dummyData['pegawai'].split('\n')[2]?.replace('Pangkat: ', '') : 'V'}<br/>
                          b. {dummyData['pegawai'] ? dummyData['pegawai'].split('\n')[3]?.replace('Jabatan: ', '') : 'OPERATOR LAYANAN OPERASIONAL'}<br/>
                          c. {dummyData['tingkat_biaya'] || 'Tingkat C'}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black p-2 text-center align-top">4</td>
                        <td className="border border-black p-2 align-top">Maksud Perjalanan Dinas</td>
                        <td className="border border-black p-2 align-top whitespace-pre-wrap">{dummyData['maksud'] || 'Menghadiri Undangan Kegiatan Rapat Koordinasi bersama Perwakilan Asing Tahun 2026'}</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-2 text-center align-top">5</td>
                        <td className="border border-black p-2 align-top">Alat Angkut Yang Digunakan</td>
                        <td className="border border-black p-2 align-top">{dummyData['alat_angkut'] || 'kendaraan'}</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-2 text-center align-top">6</td>
                        <td className="border border-black p-2 align-top">
                          a. Berangkat Dari<br/>
                          b. Tempat Tujuan
                        </td>
                        <td className="border border-black p-2 align-top">
                          a. {dummyData['berangkat_dari'] || 'Singaraja'}<br/>
                          b. {dummyData['tempat_tujuan'] || 'Denpasar'}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black p-2 text-center align-top">7</td>
                        <td className="border border-black p-2 align-top">
                          a. Lama Perjalanan Dinas<br/>
                          b. Tanggal Berangkat<br/>
                          c. Tanggal Harus Kembali / Tiba Ditempat Baru
                        </td>
                        <td className="border border-black p-2 align-top">
                          a. {dummyData['lama_perjalanan'] || '2'} (hari)<br/>
                          b. {dummyData['tanggal_berangkat'] || '28-08-2026'}<br/>
                          c. {dummyData['tanggal_kembali'] || '29-08-2026'}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black p-2 text-center align-top">8</td>
                        <td className="border border-black p-2 align-top">Pengikut : Nama<br/>1.<br/>2.<br/>3.</td>
                        <td className="border border-black p-2 align-top flex justify-between h-full">
                          <span>Tanggal lahir</span>
                          <span>Keterangan</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black p-2 text-center align-top">9</td>
                        <td className="border border-black p-2 align-top">Pembebanan Anggaran<br/>a. Instansi<br/>b. Akun</td>
                        <td className="border border-black p-2 align-top">
                          a. Kantor Imigrasi Kelas II TPI Singaraja<br/>
                          b. {dummyData['akun'] || 'BF 6161 BAA 002 51 0A 524111'}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black p-2 text-center align-top">10</td>
                        <td className="border border-black p-2 align-top">Keterangan lain-lain</td>
                        <td className="border border-black p-2 align-top"></td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <div className="flex justify-end text-sm mb-16">
                    <div className="w-64">
                      Dikeluarkan di : {dummyData['tempat_dikeluarkan'] || 'Singaraja'}<br/>
                      Tanggal : {dummyData['tanggal_dikeluarkan'] || '24-08-2026'}<br/>
                      Pejabat Pembuat Komitmen<br/>
                      <br/><br/><br/><br/>
                      <span className="uppercase">{dummyData['ppk'] ? dummyData['ppk'].split('\n')[0] : 'I KADEK DARWIN YANTO'}</span><br/>
                      {dummyData['ppk'] ? dummyData['ppk'].split('\n')[1] : 'NIP. 19791111 200112 1 002'}
                    </div>
                  </div>

                  {/* Divider Page Break */}
                  <div className="border-t-2 border-dashed border-slate-300 my-12 relative text-center">
                    <span className="bg-white px-4 text-slate-400 font-mono text-xs relative -top-2">--- HALAMAN 2 (LEMBAR BELAKANG) ---</span>
                  </div>

                  {/* --- HALAMAN 2 SPD --- */}
                  <table className="w-full border-collapse border border-black text-sm mb-8">
                    <tbody>
                      <tr>
                        <td className="border border-black p-4 w-1/2 align-top">
                          {/* Kosong sesuai template */}
                        </td>
                        <td className="border border-black p-4 w-1/2 align-top">
                          I. Berangkat dari : {dummyData['berangkat_dari'] || 'Singaraja'}<br/>
                          <span className="inline-block w-6"></span>Ke<span className="inline-block w-8 text-right">:</span> {dummyData['tempat_tujuan'] || 'Denpasar'}<br/>
                          <span className="inline-block w-6"></span>Pada Tanggal : {dummyData['tanggal_berangkat'] || '28-08-2026'}<br/>
                          <span className="inline-block w-6"></span>Kepala,<br/><br/><br/><br/>
                          <span className="font-bold">{dummyData['kepala_kantor'] ? dummyData['kepala_kantor'].split('\n')[0] : 'Anak Agung Gde Kusuma Putra'}</span><br/>
                          {dummyData['kepala_kantor'] ? dummyData['kepala_kantor'].split('\n')[1] : 'NIP. 19830123 200112 1 001'}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black p-4 align-top h-32">
                          II. Tiba di :<br/><br/>
                          <span className="inline-block w-6"></span>Pada Tanggal :<br/>
                          <span className="inline-block w-6"></span>Kepala,<br/><br/><br/><br/>
                          ....................
                        </td>
                        <td className="border border-black p-4 align-top h-32">
                          II. Berangkat dari :<br/>
                          <span className="inline-block w-6"></span>ke :<br/>
                          <span className="inline-block w-6"></span>Pada Tanggal :<br/>
                          <span className="inline-block w-6"></span>Kepala,<br/><br/><br/><br/>
                          ....................
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black p-4 align-top h-32">
                          III. Tiba di :<br/><br/>
                          <span className="inline-block w-6"></span>Pada Tanggal :<br/>
                          <span className="inline-block w-6"></span>Kepala,<br/><br/><br/><br/>
                          ....................
                        </td>
                        <td className="border border-black p-4 align-top h-32">
                          III. Berangkat dari :<br/>
                          <span className="inline-block w-6"></span>ke :<br/>
                          <span className="inline-block w-6"></span>Pada Tanggal :<br/>
                          <span className="inline-block w-6"></span>Kepala,<br/><br/><br/><br/>
                          ....................
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black p-4 align-top h-32">
                          IV. Tiba di :<br/><br/>
                          <span className="inline-block w-6"></span>Pada Tanggal :<br/>
                          <span className="inline-block w-6"></span>Kepala,<br/><br/><br/><br/>
                          ....................
                        </td>
                        <td className="border border-black p-4 align-top h-32">
                          IV. Berangkat dari :<br/>
                          <span className="inline-block w-6"></span>ke :<br/>
                          <span className="inline-block w-6"></span>Pada Tanggal :<br/>
                          <span className="inline-block w-6"></span>Kepala,<br/><br/><br/><br/>
                          ....................
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black p-4 align-top h-32">
                          V. Tiba di : {dummyData['tempat_dikeluarkan'] || 'Singaraja'}<br/>
                          <span className="inline-block w-6"></span>Pada Tanggal : {dummyData['tanggal_kembali'] || '29-08-2026'}<br/><br/>
                          <span className="inline-block w-6"></span>Pejabat Pembuat Komitmen<br/><br/><br/><br/>
                          <span className="font-bold">{dummyData['ppk'] ? dummyData['ppk'].split('\n')[0] : 'I KADEK DARWIN YANTO'}</span><br/>
                          {dummyData['ppk'] ? dummyData['ppk'].split('\n')[1] : 'NIP. 19791111 200112 1 002'}
                        </td>
                        <td className="border border-black p-4 align-top h-32 text-justify">
                          Telah diperiksa dengan keterangan bahwa perjalanan tersebut atas perintahnya dan semata-mata untuk kepentingan jabatan dalam waktu yang sesingkat-singkatnya.<br/>
                          Pejabat Pembuat Komitmen<br/><br/><br/><br/>
                          <span className="font-bold">{dummyData['ppk'] ? dummyData['ppk'].split('\n')[0] : 'I KADEK DARWIN YANTO'}</span><br/>
                          {dummyData['ppk'] ? dummyData['ppk'].split('\n')[1] : 'NIP. 19791111 200112 1 002'}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="2" className="border border-black p-2 align-top">
                          V. Catatan lain-lain :
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="2" className="border border-black p-2 align-top text-justify">
                          <strong>Perhatian :</strong><br/>
                          PPK yang menerbitkan SPD, pegawai yang melakukan perjalanan dinas, para pejabat yang mengesahkan tanggal berangkat / tiba, serta bendaharawan bertanggung jawab berdasarkan peraturan-peraturan Keuangan Negara apabila Negara menderita rugi akibat kesalahan, kelalaian dan kealpaan.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </>
              ) : (
                /* --- LAYOUT GENERIC --- */
                <>
                  {/* Tanggal & Tempat (Kanan atas) */}
                  <div className="text-right mb-6">
                    {dummyData['tempat_terbit'] || 'Jakarta'}, {dummyData['tanggal_surat'] || dummyData['tanggal_sp'] || '01 Januari 2026'}
                  </div>

                  {/* Nomor Surat dkk (Kiri) */}
                  <table className="mb-8">
                    <tbody>
                      <tr>
                        <td className="pr-4 align-top">Nomor</td>
                        <td className="px-1 align-top">:</td>
                        <td className="align-top font-bold">{dummyData['nomor_surat'] || `IMI.1-XX.XX.XX-${surat.kode}`}</td>
                      </tr>
                      <tr>
                        <td className="pr-4 align-top">Sifat</td>
                        <td className="px-1 align-top">:</td>
                        <td className="align-top">Biasa</td>
                      </tr>
                      <tr>
                        <td className="pr-4 align-top">Lampiran</td>
                        <td className="px-1 align-top">:</td>
                        <td className="align-top">-</td>
                      </tr>
                      <tr>
                        <td className="pr-4 align-top">Hal</td>
                        <td className="px-1 align-top">:</td>
                        <td className="align-top font-bold uppercase">{surat.nama}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="mb-6 text-justify">
                    <p className="mb-4">
                      Sehubungan dengan pelaksanaan tugas dan fungsi keimigrasian, bersama ini disampaikan data <strong>{surat.nama}</strong> dengan rincian sebagai berikut:
                    </p>

                    <table className="w-full mb-4">
                      <tbody>
                        {surat.variables?.filter(v => v.key !== 'tanggal_surat' && v.key !== 'tanggal_sp' && v.key !== 'nomor_surat' && v.key !== 'nomor_sp' && v.key !== 'pejabat_ttd' && v.key !== 'tempat_terbit').map((v, i) => (
                          <tr key={v.key}>
                            <td className="w-8 py-1 align-top">{i + 1}.</td>
                            <td className="w-48 py-1 align-top">{v.label}</td>
                            <td className="w-4 py-1 align-top">:</td>
                            <td className="py-1 align-top bg-yellow-50/50 outline-dashed outline-1 outline-yellow-200">
                              {Array.isArray(dummyData[v.key]) ? dummyData[v.key].join(', ') : (dummyData[v.key] || '...........................................')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <p>
                      Demikian disampaikan untuk dapat dipergunakan sebagaimana mestinya. Atas perhatian dan kerjasamanya diucapkan terima kasih.
                    </p>
                  </div>

                  {/* Tanda Tangan Generic */}
                  <div className="flex justify-end mt-16 text-center">
                    <div className="w-64">
                      <p className="mb-16">
                        <strong>
                          {surat.kategori === 'Surat Dinas' ? 'Kepala Kantor Imigrasi' : 'Pejabat Penandatangan'}
                        </strong>
                      </p>
                      {(() => {
                        const ttdVar = surat.variables?.find(v => v.type === 'pegawai');
                        if (ttdVar && dummyData[ttdVar.key]) {
                          const lines = dummyData[ttdVar.key].split('\n');
                          return (
                            <>
                              <p className="font-bold underline">{lines[0]}</p>
                              <p>{lines[1]}</p>
                            </>
                          );
                        } else {
                          return (
                            <>
                              <p className="font-bold underline">NAMA PEJABAT DUMMY</p>
                              <p>NIP. 19800000 000000 1 000</p>
                            </>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
