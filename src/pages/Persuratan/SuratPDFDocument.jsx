import React from "react";
import {
  Document, Page, View, Text, Image, StyleSheet,
} from "@react-pdf/renderer";

const KOP_LOGO = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Kementerian_Imigrasi_dan_Pemasyarakatan_Republik_Indonesia.svg/1024px-Kementerian_Imigrasi_dan_Pemasyarakatan_Republik_Indonesia.svg.png";

const S = StyleSheet.create({
  page: {
    fontFamily: "Times-Roman",
    fontSize: 11,
    paddingTop: "20mm",
    paddingBottom: "20mm",
    paddingLeft: "25mm",
    paddingRight: "25mm",
    lineHeight: 1.45,
    color: "#000",
  },
  kopRow:    { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  kopLogo:   { width: 60, height: 60 },
  kopText:   { flex: 1, textAlign: "center" },
  kopLine:   { fontFamily: "Times-Bold", fontSize: 9, textTransform: "uppercase", marginBottom: 1 },
  kopTitle:  { fontFamily: "Times-Bold", fontSize: 12, textTransform: "uppercase", marginBottom: 1 },
  kopSmall:  { fontSize: 7, marginBottom: 1 },
  hr3:       { borderBottom: 3, borderColor: "#000", marginBottom: 2 },
  hr1:       { borderBottom: 1, borderColor: "#000", marginBottom: 16 },
  center:    { textAlign: "center" },
  bold:      { fontFamily: "Times-Bold" },
  boldUnder: { fontFamily: "Times-Bold", textDecoration: "underline" },
  justify:   { textAlign: "justify" },
  row:       { flexDirection: "row" },
  col88:     { width: 88 },
  col10:     { width: 10 },
  colFlex:   { flex: 1 },
  sigWrap:   { flexDirection: "row", justifyContent: "flex-end", marginTop: 36 },
  sigBox:    { width: 210 },
  sigSpace:  { height: 50 },
  tdNo:      { width: 22, borderTop: 1, borderLeft: 1, borderBottom: 1, borderColor: "#000", padding: "4 5", fontSize: 10, textAlign: "center" },
  tdLabel:   { width: "37%", borderTop: 1, borderLeft: 1, borderBottom: 1, borderColor: "#000", padding: "4 5", fontSize: 10 },
  tdVal:     { flex: 1, border: 1, borderColor: "#000", padding: "4 5", fontSize: 10 },
});

function fmtDate(v) {
  if (!v) return "...";
  return new Date(v).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

function KopSurat() {
  return (
    <View>
      <View style={S.kopRow}>
        <Image src={KOP_LOGO} style={S.kopLogo} />
        <View style={S.kopText}>
          <Text style={S.kopLine}>Kementerian Imigrasi dan Pemasyarakatan Republik Indonesia</Text>
          <Text style={S.kopLine}>Direktorat Jenderal Imigrasi</Text>
          <Text style={S.kopLine}>Kantor Wilayah Direktorat Jenderal Imigrasi Bali</Text>
          <Text style={S.kopTitle}>Kantor Imigrasi Kelas II TPI Singaraja</Text>
          <Text style={S.kopSmall}>Jl. Raya Singaraja Seririt, Pemaron, Buleleng, Bali. Telp (0362) 32174</Text>
          <Text style={S.kopSmall}>www.singaraja.imigrasi.go.id | kanim_singaraja@imigrasi.go.id</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>
      <View style={S.hr3} />
      <View style={S.hr1} />
    </View>
  );
}

// ── Tanda Tangan ──────────────────────────────────────────────────────────────
function TandaTangan({ label, nama, nip, tempat, tanggal }) {
  return (
    <View style={S.sigWrap} wrap={false}>
      <View style={S.sigBox}>
        <View style={[S.row, { fontSize: 10, marginBottom: 2 }]}>
          <Text style={{ width: 80 }}>Dikeluarkan di</Text>
          <Text>: {tempat || "Singaraja"}</Text>
        </View>
        <View style={[S.row, { fontSize: 10, marginBottom: 10 }]}>
          <Text style={{ width: 80 }}>Pada tanggal</Text>
          <Text>: {fmtDate(tanggal)}</Text>
        </View>
        <Text style={[S.bold, { marginBottom: 4 }]}>{label}</Text>
        <View style={S.sigSpace} />
        <Text style={S.boldUnder}>{nama || "[Nama]"}</Text>
        <Text>NIP. {nip || "[NIP]"}</Text>
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SURAT PERINTAH
// ══════════════════════════════════════════════════════════════════════════════
export function SuratPerintahPDF({ displayData }) {
  const pegawaiList = displayData["pegawai_list"] || [];
  const ttdNama = displayData["penandatangan_nama"]?.split("\n")[0] || "Hendra Setiawan, A.Md.Im., S.H., M.H.";
  const ttdNip  = displayData["penandatangan_nama"]?.split("\n")[1]?.replace("NIP. ", "") || "198103232000121001";

  return (
    <Document>
      <Page size="A4" style={S.page}>
        <KopSurat />
        <View style={{ textAlign: "center", marginBottom: 20 }}>
          <Text style={S.boldUnder}>SURAT PERINTAH</Text>
          <Text>NOMOR : {displayData["nomor_sp"] || "WIM.20.IMI.3.UM.02.07-[ ...]"}</Text>
        </View>
        <View style={{ marginBottom: 14 }}>
          <View style={[S.row, { marginBottom: 8 }]}>
            <Text style={S.col88}>Menimbang</Text>
            <Text style={S.col10}>:</Text>
            <Text style={[S.colFlex, S.justify]}>{displayData["menimbang"] || "..."}</Text>
          </View>
          <View style={S.row}>
            <Text style={S.col88}>Dasar</Text>
            <Text style={S.col10}>:</Text>
            <Text style={[S.colFlex, S.justify]}>{displayData["dasar"] || "..."}</Text>
          </View>
        </View>
        <Text style={[S.bold, S.center, { marginBottom: 10 }]}>MENUGASKAN :</Text>
        <View style={S.row}>
          <Text style={S.col88}>Kepada</Text>
          <Text style={S.col10}>:</Text>
          <View style={S.colFlex}>
            {pegawaiList.length > 0
              ? pegawaiList.map((p, i) => {
                  const l = p.split("\n");
                  return (
                    <View key={i} style={{ flexDirection: "row", marginBottom: 10 }} wrap={false}>
                      <Text style={{ width: 14 }}>{i + 1}</Text>
                      <View style={{ flex: 1 }}>
                        <View style={S.row}><Text style={{ width: 60 }}>Nama</Text><Text style={{ width: 8 }}>:</Text><Text style={[S.colFlex, S.bold]}>{l[0]}</Text></View>
                        <View style={S.row}><Text style={{ width: 60 }}>NIP</Text><Text style={{ width: 8 }}>:</Text><Text style={S.colFlex}>{l[1]?.replace("NIP. ", "") || "-"}</Text></View>
                        <View style={S.row}><Text style={{ width: 60 }}>Pangkat</Text><Text style={{ width: 8 }}>:</Text><Text style={S.colFlex}>{l[2]?.replace("Pangkat: ", "") || "-"}</Text></View>
                        <View style={S.row}><Text style={{ width: 60 }}>Jabatan</Text><Text style={{ width: 8 }}>:</Text><Text style={S.colFlex}>{l[3]?.replace("Jabatan: ", "") || "-"}</Text></View>
                      </View>
                    </View>
                  );
                })
              : <Text style={{ color: "grey" }}>Belum ada pegawai dipilih...</Text>}
          </View>
        </View>
        <View style={[S.row, { marginTop: 4 }]}>
          <Text style={S.col88}>Untuk</Text>
          <Text style={S.col10}>:</Text>
          <View style={S.colFlex}>
            <Text style={{ marginBottom: 3 }}>1.  {displayData["untuk_tujuan"] || "Melaksanakan tugas..."}</Text>
            <Text style={{ marginBottom: 3 }}>2.  Melaksanakan tugas ini dengan penuh tanggung jawab;</Text>
            <Text style={{ marginBottom: 3 }}>3.  Segera melaporkan hasil pelaksanaan tugas kepada Kepala Kantor Imigrasi Kelas II TPI Singaraja;</Text>
            <Text>4.  Surat perintah ini berlaku sejak tanggal dikeluarkan.</Text>
          </View>
        </View>
        <TandaTangan
          label={"Kepala Kantor Imigrasi\nKelas II TPI Singaraja"}
          nama={ttdNama} nip={ttdNip}
          tempat={displayData["tempat_terbit"]} tanggal={displayData["tanggal_terbit"]}
        />
      </Page>
    </Document>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SURAT PERJALANAN DINAS
// ══════════════════════════════════════════════════════════════════════════════
export function SuratPerjalananDinasPDF({ displayData }) {
  const rows = [
    ["1", "Pejabat Pembuat Komitmen", displayData["ppk_nama"]?.split("\n")[0] || "[Nama PPK]"],
    ["2", "Nama Pegawai yang diperintahkan", displayData["pegawai_tugas"]?.split("\n")[0] || "[Nama Pegawai]"],
    ["3",
      "a. Pangkat dan Golongan\nb. Jabatan / Instansi\nc. Tingkat Biaya Perjalanan Dinas",
      `a. ${displayData["pegawai_tugas"]?.split("\n")[2]?.replace("Pangkat: ", "") || "[Pangkat]"}\nb. ${displayData["pegawai_tugas"]?.split("\n")[3]?.replace("Jabatan: ", "") || "[Jabatan]"}\nc. ${displayData["tingkat_biaya"] || "Tingkat C"}`],
    ["4", "Maksud Perjalanan Dinas", displayData["maksud_tugas"] || "[Maksud perjalanan]"],
    ["5", "Alat angkut yang dipergunakan", displayData["alat_angkut"] || "Kendaraan Umum / Pesawat"],
    ["6", "a. Tempat berangkat\nb. Tempat tujuan",
      `a. ${displayData["tempat_berangkat"] || "Singaraja"}\nb. ${displayData["tempat_tujuan"] || "[Tujuan]"}`],
    ["7",
      "a. Lamanya perjalanan dinas\nb. Tanggal berangkat\nc. Tanggal harus kembali",
      `a. ${displayData["lama_hari"] || "..."} (${displayData["lama_hari_terbilang"] || "..."}) hari\nb. ${displayData["tanggal_berangkat"] ? new Date(displayData["tanggal_berangkat"]).toLocaleDateString("id-ID") : "..."}\nc. ${displayData["tanggal_kembali"] ? new Date(displayData["tanggal_kembali"]).toLocaleDateString("id-ID") : "..."}`],
    ["8", "Pengikut", "-"],
    ["9", "Pembebanan Anggaran\na. Instansi\nb. Akun",
      `\na. Kantor Imigrasi Kelas II TPI Singaraja\nb. ${displayData["mak"] || "[Kode MAK]"}`],
  ];
  const ppkNama = displayData["ppk_nama"]?.split("\n")[0] || "[Nama PPK]";
  const ppkNip  = displayData["ppk_nama"]?.split("\n")[1]?.replace("NIP. ", "") || "[NIP PPK]";

  return (
    <Document>
      <Page size="A4" style={S.page}>
        <KopSurat />
        <View style={{ textAlign: "center", marginBottom: 20 }}>
          <Text style={S.boldUnder}>SURAT PERJALANAN DINAS (SPD)</Text>
          <Text>NOMOR : {displayData["nomor_spd"] || "WIM.20.IMI.3.UM.02.07-[ ...]"}</Text>
        </View>
        {rows.map(([no, label, val]) => (
          <View key={no} style={S.row} wrap={false}>
            <Text style={S.tdNo}>{no}</Text>
            <Text style={S.tdLabel}>{label}</Text>
            <Text style={S.tdVal}>{val}</Text>
          </View>
        ))}
        <TandaTangan
          label="Pejabat Pembuat Komitmen"
          nama={ppkNama} nip={ppkNip}
          tempat={displayData["tempat_terbit"]} tanggal={displayData["tanggal_terbit"]}
        />
      </Page>
    </Document>
  );
}
