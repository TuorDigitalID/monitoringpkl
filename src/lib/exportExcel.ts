import * as XLSX from 'xlsx';
import { Student, DailyJournal, AttendanceRecord, EvaluationGrade, Dudi, Teacher, User } from '../types';

export function exportStudentsToExcel(students: Student[]) {
  const data = students.map((s, idx) => ({
    No: idx + 1,
    'Nama Siswa': s.name,
    NISN: s.nisn,
    'Kelas / Jurusan': s.classMajor,
    No_HP: s.phone,
    'Industri (DUDI)': s.dudiName || 'Belum Ditentukan',
    'Guru Pembimbing': s.teacherName || 'Belum Ditentukan',
    'Status PKL': s.statusPKL.toUpperCase().replace('_', ' '),
    'Tanggal Mulai': s.startDate || '-',
    'Tanggal Selesai': s.endDate || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Siswa PKL');
  XLSX.writeFile(workbook, `SIM_PKL_Daftar_Siswa_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportJournalsToExcel(journals: DailyJournal[], studentName?: string) {
  const data = journals.map((j, idx) => ({
    No: idx + 1,
    Tanggal: j.date,
    'Nama Siswa': j.studentName,
    'Judul Kegiatan': j.activityTitle,
    Deskripsi: j.description,
    'Hasil Pembelajaran': j.learnings,
    Status: j.status.toUpperCase(),
    'Catatan Guru': j.teacherFeedback || '-',
    'Catatan DUDI': j.dudiFeedback || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Jurnal Harian');
  const filename = studentName
    ? `Jurnal_PKL_${studentName.replace(/\s+/g, '_')}.xlsx`
    : `SIM_PKL_Jurnal_Harian_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

export function exportAttendancesToExcel(attendances: AttendanceRecord[]) {
  const data = attendances.map((a, idx) => ({
    No: idx + 1,
    Tanggal: a.date,
    'Nama Siswa': a.studentName,
    'Jam Masuk': a.timeIn,
    'Jam Keluar': a.timeOut || '-',
    Status: a.status.toUpperCase(),
    'Lokasi Presensi': a.locationAddress || '-',
    Catatan: a.notes || '-',
    'Validasi DUDI': a.validatedByDudi ? 'Sudah Di-Validasi' : 'Belum Validasi'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Presensi Siswa');
  XLSX.writeFile(workbook, `SIM_PKL_Rekap_Presensi_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportGradesToExcel(grades: EvaluationGrade[]) {
  const data = grades.map((g, idx) => ({
    No: idx + 1,
    'Nama Siswa': g.studentName,
    'No Sertifikat': g.certificateNumber || '-',
    'Nilai Jurnal (20%)': g.jurnalScore,
    'Nilai Laporan (10%)': g.laporanScore,
    'Nilai Presentasi (10%)': g.presentasiScore,
    'Nilai Disiplin DUDI (15%)': g.disiplinScore,
    'Nilai Kerjasama DUDI (15%)': g.kerjasamaScore,
    'Nilai Inisiatif DUDI (15%)': g.inisiatifScore,
    'Nilai Teknis DUDI (15%)': g.teknisScore,
    'NILAI AKHIR': g.finalScore || 0,
    PREDIKAT: g.gradeLetter || '-',
    STATUS: g.isPublished ? 'Terpublikasi' : 'Draf'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Nilai PKL');
  XLSX.writeFile(workbook, `SIM_PKL_Daftar_Nilai_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function downloadStudentTemplateExcel() {
  const templateData = [
    {
      NISN: '3098182025',
      'Nama Lengkap': 'RAHMAWATI',
      Kelas: 'XII TKR',
      Jurusan: 'Teknik Kendaraan Ringan',
      Password: 'password123'
    },
    {
      NISN: '0088888728',
      'Nama Lengkap': 'ALIF KHAIRUL SABILILLAH',
      Kelas: 'XII RPL 1',
      Jurusan: 'Rekayasa Perangkat Lunak',
      Password: 'password123'
    },
    {
      NISN: '0084394725',
      'Nama Lengkap': 'WAHYU RAMADHAN',
      Kelas: 'XII TKJ 1',
      Jurusan: 'Teknik Komputer & Jaringan',
      Password: 'password123'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Siswa');
  XLSX.writeFile(workbook, 'Template_Master_Data_Siswa_PKL.xlsx');
}

export function downloadDudiTemplateExcel() {
  const templateData = [
    {
      'Nama Instansi / Perusahaan': 'PT. Flexofast',
      'Alamat Lengkap': 'Jl. Pembangunan No.9, RT.01/RW.02',
      'Kuota Siswa': 2,
      'Nama Pembimbing Lapangan': 'Budi Santoso',
      'No HP Pembimbing': '085212345678'
    },
    {
      'Nama Instansi / Perusahaan': 'Bengkel Pancuran Mas',
      'Alamat Lengkap': 'Jl. Bio Banten Kampung Sindang',
      'Kuota Siswa': 1,
      'Nama Pembimbing Lapangan': 'Ahmad Dahlan',
      'No HP Pembimbing': '081298765432'
    },
    {
      'Nama Instansi / Perusahaan': 'Konfeksi Gintung Tugu',
      'Alamat Lengkap': 'Gintung Tugu',
      'Kuota Siswa': 3,
      'Nama Pembimbing Lapangan': 'Siti Hajar',
      'No HP Pembimbing': '081311223344'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Instansi');
  XLSX.writeFile(workbook, 'Template_Master_Instansi_PKL.xlsx');
}

export function exportDudisToExcel(dudis: Dudi[]) {
  const data = dudis.map((d, idx) => ({
    No: idx + 1,
    'Nama DUDI / Industri': d.name,
    Kategori: d.category,
    Alamat: d.address,
    Kota: d.city,
    'Kontak Person (PIC)': d.contactPerson,
    No_HP: d.phone,
    Email: d.email,
    Kuota: d.quota,
    'Terisi (Siswa)': d.assignedCount,
    'Jurusan Diterima': d.acceptedMajors.join(', '),
    Status: d.status.toUpperCase()
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Mitra DUDI');
  XLSX.writeFile(workbook, `SIM_PKL_Daftar_DUDI_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function downloadTeacherTemplateExcel() {
  const templateData = [
    {
      'NIP/NIK': '2026006',
      'Nama Lengkap': 'DWI FANNI SUPRIYANTI, S.Pd.',
      'Email / ID Unik': '2026006@guru.simpkl.com',
      'Nomor Telepon': '081299887766',
      Password: 'guru@123'
    },
    {
      'NIP/NIK': '197508122005011002',
      'Nama Lengkap': 'Drs. Bambang Hidayat, M.Pd.',
      'Email / ID Unik': 'bambang.guru@smkn1.sch.id',
      'Nomor Telepon': '081122334455',
      Password: 'password123'
    },
    {
      'NIP/NIK': '198203152009022001',
      'Nama Lengkap': 'Eka Wijaya, S.T., M.T.',
      'Email / ID Unik': 'eka.guru@smkn1.sch.id',
      'Nomor Telepon': '081255667788',
      Password: 'password123'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Guru Pembimbing');
  XLSX.writeFile(workbook, 'Template_Master_Guru_Pembimbing_PKL.xlsx');
}

export function downloadPlottingTemplateExcel() {
  const templateData = [
    {
      NISN: '0071234567',
      'Nama Siswa': 'RAHMAWATI',
      'Nama Instansi / Perusahaan': 'PT. Flexofast',
      'Nama Guru Pembimbing': 'DWI FANNI SUPRIYANTI, S.Pd.',
      'Tanggal Mulai (YYYY-MM-DD)': '2026-07-16',
      'Tanggal Selesai (YYYY-MM-DD)': '2026-10-16'
    },
    {
      NISN: '0088888728',
      'Nama Siswa': 'BUDI SANTOSO',
      'Nama Instansi / Perusahaan': 'Bengkel Pancuran Mas',
      'Nama Guru Pembimbing': 'Drs. Bambang Hidayat, M.Pd.',
      'Tanggal Mulai (YYYY-MM-DD)': '2026-07-16',
      'Tanggal Selesai (YYYY-MM-DD)': '2026-10-16'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Plotting');
  XLSX.writeFile(workbook, 'Template_Plotting_Siswa_DUDI_Guru.xlsx');
}

export function downloadUserTemplateExcel() {
  const templateData = [
    {
      'Nama Lengkap': 'RAHMAWATI',
      'Email / ID Unik': '3098182025@siswa.simpkl.com',
      Peran: 'siswa', // siswa, guru, admin
      'NISN / NIP': '3098182025',
      Kelas: 'XII TKR',
      Jurusan: 'Teknik Kendaraan Ringan',
      'Nomor Telepon': '081234567890',
      Password: 'password123'
    },
    {
      'Nama Lengkap': 'DWI FANNI SUPRIYANTI, S.Pd.',
      'Email / ID Unik': '2026006@guru.simpkl.com',
      Peran: 'guru',
      'NISN / NIP': '2026006',
      Kelas: '',
      Jurusan: '',
      'Nomor Telepon': '081299887766',
      Password: 'guru@123'
    },
    {
      'Nama Lengkap': 'KOORDINATOR PKL (SUPER ADMIN)',
      'Email / ID Unik': 'admin@simpkl.com',
      Peran: 'admin',
      'NISN / NIP': '198501012010011001',
      Kelas: '',
      Jurusan: '',
      'Nomor Telepon': '081234567890',
      Password: 'admin123'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Pengguna');
  XLSX.writeFile(workbook, 'Template_Master_Pengguna_SIM_PKL.xlsx');
}

export function exportUsersToExcel(users: User[]) {
  const data = users.map((u, idx) => ({
    No: idx + 1,
    'Nama Lengkap': u.name,
    Email: u.email,
    'Peran / Role': u.role.toUpperCase(),
    'NISN / NIP': u.nisn || u.nip || '-',
    Kelas: u.classMajor || '-',
    'No Telepon': u.phone || '-',
    Password: u.password || 'password123'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pengguna SIM PKL');
  XLSX.writeFile(workbook, `SIM_PKL_Daftar_Pengguna_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportTeachersToExcel(teachers: Teacher[]) {
  const data = teachers.map((t, idx) => ({
    No: idx + 1,
    'NIP / NIK': t.nip,
    'Nama Lengkap': t.name,
    Email: t.email,
    'No Telepon': t.phone,
    'Bimbingan Siswa': t.assignedStudentCount
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Guru Pembimbing');
  XLSX.writeFile(workbook, `SIM_PKL_Daftar_Guru_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

