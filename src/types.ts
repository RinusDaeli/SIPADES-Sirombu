export type UserRole = 'super_admin' | 'admin_kecamatan' | 'admin_desa';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  desaId?: string;
  desaName?: string;
  nip?: string;
  phone?: string;
  createdAt: string;
}

export interface Desa {
  id: string;
  name: string;
  code: string;
  kepalaDesa: string;
  nipKepalaDesa?: string;
  alamatDesa?: string;
  emailDesa?: string;
  nomorHp?: string;
  kodePos?: string;
  kaurAset?: string;
  sekdes?: string;
  sekretarisDesa?: string;
  kontak?: string;
}

export type KlasAset =
  | 'Tanah'
  | 'Peralatan, Mesin, dan Alat Berat'
  | 'Kendaraan'
  | 'Gedung dan Bangunan'
  | 'Jalan'
  | 'Jembatan'
  | 'Irigasi/Embung/Air Sungai/Drainase'
  | 'Jaringan/Instalasi'
  | 'Aset Tetap Lainnya'
  | 'Konstruksi dalam Pengerjaan';

export type SumberDana = 'DDS' | 'ADD' | 'PBH' | 'DLL';

export type KondisiAset = 'Baik' | 'Rusak Ringan' | 'Rusak Berat';

export interface BuktiKepemilikan {
  jenis: string; // e.g. HGB, Sertifikat Hak Pakai, BPKB, IMB/PBG, Kwitansi/BAST, dll.
  nomor: string;
  tanggal: string;
}

export type StatusAset = 'aktif' | 'mutasi_diajukan' | 'terhapus_diajukan' | 'terhapus';

export interface Aset {
  id: string;
  desaId: string;
  desaName: string;
  klasifikasi: KlasAset;
  namaAset: string;
  kodeAset: string;
  nomorRegister?: string; // 4-digit sequence register according to Permendagri No. 20/2018 (e.g. 0001)
  bukti: BuktiKepemilikan;
  tahunPerolehan: number;
  nilaiPerolehan: number;
  kondisi: KondisiAset;
  sumberDana: SumberDana;
  volume?: string; // e.g. Luas 2200 m2, 1 Unit, 800m
  lokasi?: string;
  keterangan: string;
  fotoAset?: string[]; // Foto fisik aset (maksimal 5 foto, minimal 1 foto saat input)
  fotoBast?: string; // Foto BAST Aset kepada pengguna / Berita Acara Serah Terima
  status: StatusAset;
  createdAt: string;
  updatedAt: string;
}

export type TipeVerifikasi = 'mutasi' | 'penghapusan';
export type StatusVerifikasi = 'menunggu_verifikasi' | 'disetujui' | 'ditolak';

export interface PermohonanVerifikasi {
  id: string;
  asetId: string;
  desaId: string;
  desaName: string;
  tipe: TipeVerifikasi;
  asetSnapshot: Aset;
  tanggalPengajuan: string;
  alasan: string;
  nomorSuratDesa: string;
  dokumenPendukung: string; // e.g. Berita Acara Musyawarah Desa No. ...
  tujuanMutasi?: string; // e.g. Hibah ke BUMDes / Pemkab Nias Barat
  status: StatusVerifikasi;
  tanggalDiproses?: string;
  diverifikasiOleh?: string;
  catatanKecamatan?: string;
  nomorSKKecamatan?: string;
}

export interface PengesahanLaporan {
  id: string;
  desaId: string;
  desaName: string;
  tahun: number;
  status: 'draft' | 'diajukan' | 'disetujui' | 'perlu_perbaikan';
  catatanKecamatan?: string;
  diajukanPada?: string;
  disetujuiPada?: string;
  disetujuiOleh?: string;
}

export interface KecamatanProfile {
  namaKecamatan: string;
  kabupaten: string;
  namaCamat: string;
  pangkatCamat: string;
  nipCamat: string;
  jabatanCamat?: string;
  alamatKantor: string;
  kodePos: string;
  emailKantor: string;
  teleponKantor: string;
  tempatSurat: string;
}

