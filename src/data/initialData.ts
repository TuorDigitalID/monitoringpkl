import { User, Student, Teacher, Dudi, DailyJournal, AttendanceRecord, EvaluationGrade, SupervisionLog, ApplicationLetter, ClassMajorItem } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'SUPER ADMIN KOORDINATOR',
    email: 'admin@simpkl.com',
    role: 'admin',
    nip: '198501012010011001',
    phone: '08123456789',
    password: 'admin123'
  },
  {
    id: 'usr-tch-1',
    name: 'Drs. Bambang Hidayat, M.Pd.',
    email: 'bambang@guru.simpkl.com',
    role: 'guru',
    nip: '198203152010011002',
    phone: '081234567891',
    password: 'guru@123'
  },
  {
    id: 'usr-std-1',
    name: 'Ahmad Fauzi',
    email: '0054321098@siswa.simpkl.com',
    role: 'siswa',
    nisn: '0054321098',
    classMajor: 'XII RPL 1',
    phone: '081234567890',
    password: 'password123'
  },
  {
    id: 'usr-dudi-1',
    name: 'PT Telkom Indonesia Tbk',
    email: 'dudi@telkom.co.id',
    role: 'dudi',
    phone: '0211234567',
    password: 'dudi123'
  }
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'tch-1',
    name: 'Drs. Bambang Hidayat, M.Pd.',
    nip: '198203152010011002',
    email: 'bambang@guru.simpkl.com',
    phone: '081234567891',
    assignedStudentCount: 2,
    password: 'guru@123'
  },
  {
    id: 'tch-2',
    name: 'Siti Aminah, S.Kom.',
    nip: '198805202015022003',
    email: 'siti@guru.simpkl.com',
    phone: '081234567892',
    assignedStudentCount: 1,
    password: 'guru@123'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-1',
    name: 'Ahmad Fauzi',
    nisn: '0054321098',
    classMajor: 'XII RPL 1',
    phone: '081234567890',
    dudiId: 'dudi-1',
    dudiName: 'PT Telkom Indonesia Tbk',
    teacherId: 'tch-1',
    teacherName: 'Drs. Bambang Hidayat, M.Pd.',
    statusPKL: 'sedang_pkl',
    startDate: '2026-07-01',
    endDate: '2026-10-01'
  },
  {
    id: 'std-2',
    name: 'Budi Santoso',
    nisn: '0054321099',
    classMajor: 'XII TKR 1',
    phone: '081234567895',
    dudiId: 'dudi-1',
    dudiName: 'PT Telkom Indonesia Tbk',
    teacherId: 'tch-1',
    teacherName: 'Drs. Bambang Hidayat, M.Pd.',
    statusPKL: 'sedang_pkl',
    startDate: '2026-07-01',
    endDate: '2026-10-01'
  },
  {
    id: 'std-3',
    name: 'Cantika Putri',
    nisn: '0054321100',
    classMajor: 'XII DKV 1',
    phone: '081234567896',
    teacherId: 'tch-2',
    teacherName: 'Siti Aminah, S.Kom.',
    statusPKL: 'belum_dapat'
  }
];

export const INITIAL_DUDIS: Dudi[] = [
  {
    id: 'dudi-1',
    name: 'PT Telkom Indonesia Tbk',
    category: 'Software & IT',
    address: 'Jl. Jend. Sudirman No. 12',
    city: 'Jakarta Pusat',
    contactPerson: 'Ir. Hendra Gunawan',
    phone: '0211234567',
    email: 'dudi@telkom.co.id',
    quota: 5,
    assignedCount: 2,
    acceptedMajors: ['RPL', 'TKJ'],
    status: 'aktif'
  }
];

export const INITIAL_CLASSES: ClassMajorItem[] = [
  { id: 'cls-1', className: 'XII RPL 1', majorName: 'Rekayasa Perangkat Lunak' },
  { id: 'cls-2', className: 'XII TKR 1', majorName: 'Teknik Kendaraan Ringan' },
  { id: 'cls-3', className: 'XII DKV 1', majorName: 'Desain Komunikasi Visual' }
];

export const INITIAL_ATTENDANCES: AttendanceRecord[] = [];

export const INITIAL_JOURNALS: DailyJournal[] = [];

export const INITIAL_SUPERVISIONS: SupervisionLog[] = [];

export const INITIAL_GRADES: EvaluationGrade[] = [];

export const INITIAL_LETTERS: ApplicationLetter[] = [];

