export type UserRole = 'siswa' | 'guru' | 'dudi' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  nisn?: string;
  nip?: string;
  phone?: string;
  classMajor?: string; // e.g. "XII RPL 1", "XII TKJ 2"
  dudiId?: string;
  teacherId?: string;
  password?: string;
}

export interface Dudi {
  id: string;
  name: string;
  category: string; // e.g. "Software & IT", "Otomotif", "Akuntansi & Keuangan"
  address: string;
  city: string;
  contactPerson: string;
  phone: string;
  email: string;
  quota: number;
  assignedCount: number;
  acceptedMajors: string[]; // e.g. ["RPL", "TKJ"]
  rating?: number;
  status: 'aktif' | 'penuh' | 'nonaktif';
}

export interface Student {
  id: string;
  name: string;
  nisn: string;
  classMajor: string; // e.g. "XII RPL 1"
  phone: string;
  dudiId?: string;
  dudiName?: string;
  teacherId?: string;
  teacherName?: string;
  industrySupervisorName?: string;
  statusPKL: 'belum_dapat' | 'mengajukan' | 'sedang_pkl' | 'selesai' | 'ditolak';
  startDate?: string;
  endDate?: string;
  photoUrl?: string;
}

export interface Teacher {
  id: string;
  name: string;
  nip: string;
  phone: string;
  email: string;
  assignedStudentCount: number;
  password?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  timeIn: string; // HH:mm
  timeOut?: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alpa';
  notes?: string;
  locationAddress?: string;
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
  validatedByDudi?: boolean;
}

export interface DailyJournal {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  activityTitle: string;
  description: string;
  learnings: string;
  photoUrl?: string;
  status: 'menunggu' | 'disetujui' | 'revisi' | 'ditolak';
  teacherFeedback?: string;
  dudiFeedback?: string;
  aiPolished?: boolean;
}

export interface SupervisionLog {
  id: string;
  teacherId: string;
  teacherName: string;
  dudiId: string;
  dudiName: string;
  date: string;
  notes: string;
  studentsPresent: string[]; // Student IDs
  photoUrl?: string;
}

export interface EvaluationGrade {
  id: string;
  studentId: string;
  studentName: string;
  dudiId: string;
  // Nilai Sekolah (40%)
  jurnalScore: number;
  laporanScore: number;
  presentasiScore: number;
  // Nilai DUDI / Industri (60%)
  disiplinScore: number;
  kerjasamaScore: number;
  inisiatifScore: number;
  teknisScore: number;
  finalScore?: number;
  gradeLetter?: string; // A, B, C, D
  certificateNumber?: string;
  isPublished: boolean;
}

export interface ApplicationLetter {
  id: string;
  letterNumber: string;
  studentIds: string[];
  dudiId: string;
  dudiName: string;
  createdAt: string;
  status: 'draft' | 'terkirim' | 'diterima' | 'ditolak';
  content: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

export interface ClassMajorItem {
  id: string;
  className: string;
  majorName: string;
}

