import React, { useMemo } from "react";
import { PDFViewer, Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

// ─── UTILS ──────────────────────────────────────────────────────────────────
const fmtDate = v => v
  ? new Date(v).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
  : "...";

const fmtDateDash = v => {
  if (!v) return "...";
  const d = new Date(v);
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
};

// ─── STYLES (Menggunakan Yoga Flexbox ala React Native) ────────────────────
const styles = StyleSheet.create({
  page: {
    paddingTop: 56,      // ~20mm
    paddingBottom: 56,   // ~20mm
    paddingLeft: 70,     // ~25mm
    paddingRight: 70,    // ~25mm
    fontFamily: 'Times-Roman',
    fontSize: 11,
    lineHeight: 1.5,
  },
  // KOP SURAT
  kopContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  logoBox: { width: 85, alignItems: 'center', justifyContent: 'center' }, // Dikurangi sedikit agar ruang teks lebih luas
  logo: { width: 75, height: 75 },
  kopText: { flex: 1, alignItems: 'center', paddingRight: 0 }, // Hapus padding kanan agar teks bisa membentang penuh
  title1: { fontFamily: 'Helvetica', fontSize: 9.5, textTransform: 'uppercase', marginBottom: 1.5 }, // Kurangi sedikit ukurannya agar muat 1 baris
  title2: { fontFamily: 'Helvetica-Bold', fontSize: 12.5, textTransform: 'uppercase', marginTop: 2, marginBottom: 3, letterSpacing: 0.5 },
  address: { fontFamily: 'Helvetica', fontSize: 8.5, marginBottom: 1 },
  line1: { borderBottomWidth: 3, borderBottomColor: '#000', marginBottom: 18 },

  // GLOBAL COMPONENTS
  header: { alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontFamily: 'Helvetica-Bold', textDecoration: 'underline', fontSize: 11.5, marginBottom: 2 },
  headerNumber: { fontFamily: 'Helvetica-Bold', fontSize: 11.5 },
  row: { flexDirection: 'row', marginBottom: 4 },
  labelCol: { width: 75 },
  colonCol: { width: 10 },
  valueCol: { flex: 1, textAlign: 'justify' },
  
  // TANDA TANGAN
  ttdContainer: { alignItems: 'flex-end', marginTop: 30 },
  ttdBox: { width: 200 },
  ttdTitle: { fontFamily: 'Times-Bold', marginTop: 10, marginBottom: 50 },
  ttdName: { fontFamily: 'Times-Bold', textDecoration: 'underline' },

  // TABEL SPD
  table: { width: '100%', borderWidth: 1, borderColor: '#000', borderBottomWidth: 0, borderRightWidth: 0 },
  tr: { flexDirection: 'row' },
  tdNum: { width: 30, borderWidth: 1, borderColor: '#000', borderTopWidth: 0, borderLeftWidth: 0, padding: 5, textAlign: 'center' },
  tdLabel: { width: '37%', borderWidth: 1, borderColor: '#000', borderTopWidth: 0, borderLeftWidth: 0, padding: 5 },
  tdVal: { flex: 1, borderWidth: 1, borderColor: '#000', borderTopWidth: 0, borderLeftWidth: 0, padding: 5 },
});

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────
const KopSurat = () => (
  <View>
    <View style={styles.kopContainer}>
      <View style={styles.logoBox}>
        {/* Mengambil logo dari folder public/logo-imigrasi.png menggunakan absolute URL */}
        <Image src={window.location.origin + "/logo-imigrasi.png"} style={styles.logo} />
      </View>
      <View style={styles.kopText}>
        <Text style={styles.title1}>Kementerian Imigrasi dan Pemasyarakatan Republik Indonesia</Text>
        <Text style={styles.title1}>Direktorat Jenderal Imigrasi</Text>
        <Text style={styles.title1}>Kantor Wilayah Direktorat Jenderal Imigrasi Bali</Text>
        <Text style={styles.title2}>Kantor Imigrasi Kelas II TPI Singaraja</Text>
        <Text style={styles.address}>Jl. Raya Singaraja Seririt, Pemaron, Buleleng, Bali. Telepon ( 0362 ) 32174</Text>
        <Text style={styles.address}>Laman: www.singaraja.imigrasi.go.id Pos-el: kanim_singaraja@imigrasi.go.id</Text>
      </View>
    </View>
    <View style={styles.line1} />
  </View>
);

const SuratPerintah = ({ data }) => (
  <View>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>SURAT PERINTAH</Text>
      <Text>NOMOR : {data["nomor_sp"] || "WIM.20.IMI.3.UM.02.07-[ ...]"}</Text>
    </View>

    <View style={{ marginBottom: 10 }}>
      <View style={styles.row}>
        <Text style={styles.labelCol}>Menimbang</Text>
        <Text style={styles.colonCol}>:</Text>
        <Text style={styles.valueCol}>{data["menimbang"]}</Text>
      </View>
      <View style={[styles.row, { marginBottom: 10 }]} wrap={false}>
        <Text style={styles.labelCol}>Dasar</Text>
        <Text style={styles.colonCol}>:</Text>
        <View style={styles.valueCol}>
          {Array.isArray(data["dasar"]) ? (
            data["dasar"].map((poin, idx) => (
              <View key={idx} style={{ flexDirection: 'row', marginBottom: 2 }}>
                <Text style={{ width: 15 }}>{idx + 1}.</Text>
                <Text style={{ flex: 1, textAlign: 'justify' }}>{poin || "..."}</Text>
              </View>
            ))
          ) : (
            <Text style={{ textAlign: 'justify' }}>{data["dasar"]}</Text>
          )}
        </View>
      </View>
    </View>

    <Text style={{ fontFamily: 'Times-Bold', textAlign: 'center', marginTop: 5, marginBottom: 10 }}>MENUGASKAN :</Text>

    <View style={styles.row}>
      <Text style={styles.labelCol}>Kepada</Text>
      <Text style={styles.colonCol}>:</Text>
      <View style={styles.valueCol}>
        {data["pegawai_list"]?.length > 0 ? (
          data["pegawai_list"].map((p, i) => {
            const l = p.split("\n");
            return (
              <View key={i} style={{ flexDirection: 'row', marginBottom: 10 }} wrap={false}>
                <Text style={{ width: 15 }}>{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <View style={styles.row}><Text style={{ width: 50 }}>Nama</Text><Text style={styles.colonCol}>:</Text><Text style={{ fontFamily: 'Times-Bold' }}>{l[0]}</Text></View>
                  <View style={styles.row}><Text style={{ width: 50 }}>NIP</Text><Text style={styles.colonCol}>:</Text><Text>{l[1]?.replace("NIP. ", "") || "-"}</Text></View>
                  <View style={styles.row}><Text style={{ width: 50 }}>Pangkat</Text><Text style={styles.colonCol}>:</Text><Text>{l[2]?.replace("Pangkat: ", "") || "-"}</Text></View>
                  <View style={styles.row}><Text style={{ width: 50 }}>Jabatan</Text><Text style={styles.colonCol}>:</Text><Text>{l[3]?.replace("Jabatan: ", "") || "-"}</Text></View>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={{ fontStyle: 'italic', color: 'gray' }}>Belum ada pegawai dipilih...</Text>
        )}
      </View>
    </View>

    <View style={[styles.row, { marginTop: 5 }]} wrap={false}>
      <Text style={styles.labelCol}>Untuk</Text>
      <Text style={styles.colonCol}>:</Text>
      <View style={styles.valueCol}>
        <View style={{ flexDirection: 'row', marginBottom: 3 }}><Text style={{ width: 15 }}>1.</Text><Text style={styles.valueCol}>{data["kegiatan_poin_1"] || "Melaksanakan tugas..."}</Text></View>
        <View style={{ flexDirection: 'row', marginBottom: 3 }}><Text style={{ width: 15 }}>2.</Text><Text style={styles.valueCol}>Melaksanakan tugas ini dengan penuh tanggung jawab;</Text></View>
        <View style={{ flexDirection: 'row', marginBottom: 3 }}><Text style={{ width: 15 }}>3.</Text><Text style={styles.valueCol}>Segera melaporkan hasil pelaksanaan tugas kepada Kepala Kantor Imigrasi Kelas II TPI Singaraja;</Text></View>
        <View style={{ flexDirection: 'row', marginBottom: 3 }}><Text style={{ width: 15 }}>4.</Text><Text style={styles.valueCol}>Surat perintah ini berlaku sejak tanggal dikeluarkan.</Text></View>
      </View>
    </View>

    <View style={styles.ttdContainer} wrap={false}>
      <View style={styles.ttdBox}>
        <View style={styles.row}><Text style={styles.labelCol}>Dikeluarkan di</Text><Text style={styles.colonCol}>:</Text><Text style={styles.valueCol}>{data["tempat_terbit"] || "Singaraja"}</Text></View>
        <View style={styles.row}><Text style={styles.labelCol}>Pada tanggal</Text><Text style={styles.colonCol}>:</Text><Text style={styles.valueCol}>{fmtDate(data["tanggal_sp"])}</Text></View>
        
        <Text style={styles.ttdTitle}>Kepala Kantor Imigrasi{"\n"}Kelas II TPI Singaraja</Text>
        <Text style={styles.ttdName}>{data["pejabat_ttd"]?.split("\n")[0] || "Hendra Setiawan, A.Md.Im., S.H., M.H."}</Text>
        <Text>NIP. {data["pejabat_ttd"]?.split("\n")[1]?.replace("NIP. ", "") || "198103232000121001"}</Text>
      </View>
    </View>
  </View>
);

const SuratPerjalananDinas = ({ data }) => {
    const rows = [
      [1, "Pejabat Pembuat Komitmen", <Text>Kantor Imigrasi Kelas II Singaraja{"\n"}<Text style={{ fontFamily: 'Times-Bold' }}>{data["ppk"]?.split("\n")[0]?.toUpperCase() || "[NAMA PPK]"}</Text></Text>],
      [2, "Nama/ NIP pegawai yang melaksanakan tugas", <Text style={{ fontFamily: 'Times-Bold' }}>{data["pegawai"]?.split("\n")[0]?.toUpperCase() || "[NAMA PEGAWAI]"}{"\n"}<Text style={{ fontFamily: 'Times-Roman' }}>{data["pegawai"]?.split("\n")[1]?.replace("NIP. ", "") || "[NIP]"}</Text></Text>],
      [3, <View><Text>a. Pangkat dan Golongan</Text><Text>b. Jabatan/Instansi</Text><Text>c. Tingkat Biaya Perjalanan Dinas</Text></View>,
          <View><Text>a. {data["pegawai"]?.split("\n")[2]?.replace("Pangkat: ", "") || "[Pangkat]"}</Text><Text>b. {data["pegawai"]?.split("\n")[3]?.replace("Jabatan: ", "")?.toUpperCase() || "[JABATAN]"}</Text><Text>c. {data["tingkat_biaya"] || "Tingkat C"}</Text></View>],
      [4, "Maksud Perjalanan Dinas", <Text>{data["maksud"] || "[Maksud perjalanan]"}</Text>],
      [5, "Alat Angkut Yang Digunakan", <Text>{data["alat_angkut"] ? data["alat_angkut"].toLowerCase() : "kendaraan"}</Text>],
      [6, <View><Text>a. Berangkat Dari</Text><Text>b. Tempat Tujuan</Text></View>,
          <View><Text>a. {data["berangkat_dari"] || "Singaraja"}</Text><Text>b. {data["tempat_tujuan"] || "[Tujuan]"}</Text></View>],
      [7, <View><Text>a. Lama Perjalanan Dinas</Text><Text>b. Tanggal Berangkat</Text><Text>c. Tanggal Harus Kembali / Tiba Ditempat Baru</Text></View>,
          <View>
            <Text>a. {(() => {
              if (data["tanggal_berangkat"] && data["tanggal_kembali"]) {
                const start = new Date(data["tanggal_berangkat"]);
                const end = new Date(data["tanggal_kembali"]);
                const diffTime = end.getTime() - start.getTime();
                const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24))) + 1;
                return diffDays;
              }
              return "...";
            })()}</Text>
            <Text>b. {data["tanggal_berangkat"] ? fmtDateDash(data["tanggal_berangkat"]) : "..."}</Text>
            <Text>c. {data["tanggal_kembali"] ? fmtDateDash(data["tanggal_kembali"]) : "..."}</Text>
          </View>],
      [8, <View><Text>Pengikut : Nama</Text><Text>1.</Text><Text>2.</Text><Text>3.</Text></View>,
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text>Tanggal lahir</Text><Text>Keterangan</Text></View>],
      [9, <View><Text>Pembebanan Anggaran</Text><Text>a. Instansi</Text><Text>b. Akun</Text></View>,
          <View><Text>a. Kantor Imigrasi Kelas II TPI Singaraja</Text><Text>b. {data["akun"] || "[Kode MAK]"}</Text></View>],
      [10, "Keterangan lain-lain", <Text></Text>]
    ];

    return (
      <View>
        <View style={{ alignItems: 'flex-end', marginBottom: 20, fontSize: 10, fontFamily: 'Times-Roman' }}>
          <View style={{ width: 180 }}>
            <View style={{ flexDirection: 'row' }}><Text style={{ width: 50 }}>Lembar ke I</Text><Text>: </Text></View>
            <View style={{ flexDirection: 'row' }}><Text style={{ width: 50 }}>Kode No.</Text><Text>: </Text></View>
            <View style={{ flexDirection: 'row' }}><Text style={{ width: 50 }}>Nomor</Text><Text>: {data["nomor_spd"] || ""}</Text></View>
          </View>
        </View>

        <View style={styles.header}>
          <Text style={{ fontFamily: 'Helvetica-Bold', textDecoration: 'underline', fontSize: 12, marginBottom: 2 }}>SURAT PERJALANAN DINAS (SPD)</Text>
        </View>
        
        <View style={styles.table}>
          {rows.map(([no, label, val]) => (
            <View key={no} style={styles.tr} wrap={false}>
              <View style={styles.tdNum}><Text>{no}</Text></View>
              <View style={styles.tdLabel}>{typeof label === 'string' ? <Text>{label}</Text> : label}</View>
              <View style={styles.tdVal}>{typeof val === 'string' ? <Text>{val}</Text> : val}</View>
            </View>
          ))}
        </View>

        <View style={styles.ttdContainer} wrap={false}>
          <View style={styles.ttdBox}>
            <View style={styles.row}><Text style={styles.labelCol}>Dikeluarkan di</Text><Text style={styles.colonCol}>:</Text><Text style={styles.valueCol}>{data["tempat_dikeluarkan"] || "Singaraja"}</Text></View>
            <View style={styles.row}><Text style={styles.labelCol}>Tanggal</Text><Text style={styles.colonCol}>:</Text><Text style={styles.valueCol}>{data["tanggal_dikeluarkan"] ? fmtDateDash(data["tanggal_dikeluarkan"]) : "..."}</Text></View>
            
            <Text style={{ fontFamily: 'Times-Roman', marginTop: 2, marginBottom: 50 }}>Pejabat Pembuat Komitmen</Text>
            <Text style={{ fontFamily: 'Times-Roman' }}>{data["ppk"]?.split("\n")[0]?.toUpperCase() || "[NAMA PPK]"}</Text>
            <Text>NIP. {data["ppk"]?.split("\n")[1]?.replace("NIP. ", "") || "[NIP PPK]"}</Text>
          </View>
        </View>
      </View>
    );
  };

// ─── DOKUMEN UTAMA ────────────────────────────────────────────────────────
const MyPdfDocument = ({ surat, data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <KopSurat />
      {surat.id === "surat-perintah" ? (
        <SuratPerintah data={data} />
      ) : surat.id === "surat-perjalanan-dinas" ? (
        <SuratPerjalananDinas data={data} />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'gray' }}>Template belum dikonfigurasi.</Text>
        </View>
      )}
    </Page>
  </Document>
);

// ─── KOMPONEN PREVIEWER ───────────────────────────────────────────────────
export default function SuratPreviewCanvas({ surat, formData }) {
  // Gunakan teknik Debounce (tunda render) selama 600ms.
  // Ini akan mencegah PDF iframe berkedip (blinking) saat user sedang asyik mengetik.
  const [debouncedFormData, setDebouncedFormData] = React.useState(formData);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFormData(formData);
    }, 600);
    return () => clearTimeout(handler);
  }, [formData]);

  const displayData = useMemo(() => {
    const d = { ...debouncedFormData };
    surat?.variables?.forEach(v => {
      if (d[v.key] !== undefined && d[v.key] !== "") return;
      if (v.type === "text")     d[v.key] = "[ ... ]";
      if (v.type === "textarea") d[v.key] = "[ ... ]";
      if (v.type === "date")     d[v.key] = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
      if (v.type === "pegawai")  d[v.key] = "Nama Pegawai\nNIP. -";
      if (v.type === "number")   d[v.key] = "Rp 0,-";
    });
    return d;
  }, [surat, debouncedFormData]);

  // Gunakan useMemo untuk merender PDFViewer HANYA ketika displayData benar-benar berubah.
  // Ini mencegah PDFViewer me-render ulang saat props formData masuk dengan cepat.
  const pdfElement = useMemo(() => (
    <PDFViewer style={{ width: "100%", height: "100%", border: "none" }} showToolbar={true}>
      <MyPdfDocument surat={surat} data={displayData} />
    </PDFViewer>
  ), [surat, displayData]);

  if (!surat) return null;

  return (
    <div className="w-full h-full bg-slate-200">
      {pdfElement}
    </div>
  );
}
