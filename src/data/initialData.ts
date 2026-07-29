import { User, Student, Teacher, Dudi, DailyJournal, AttendanceRecord, EvaluationGrade, SupervisionLog, ApplicationLetter, ClassMajorItem } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-s1',
    name: 'Ahmad Rizky Pratama',
    email: 'rizky.siswa@smkn1.sch.id',
    role: 'siswa',
    nisn: '0054321098',
    classMajor: 'XII RPL 1',
    phone: '081234567890',
    dudiId: 'dudi-1',
    teacherId: 'usr-g1',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-s2',
    name: 'Siti Nurhaliza',
    email: 'siti.siswa@smkn1.sch.id',
    role: 'siswa',
    nisn: '0054321099',
    classMajor: 'XII TKJ 2',
    phone: '081298765432',
    dudiId: 'dudi-2',
    teacherId: 'usr-g2',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-s3',
    name: 'Budi Santoso',
    email: 'budi.siswa@smkn1.sch.id',
    role: 'siswa',
    nisn: '0054321100',
    classMajor: 'XII DKV 1',
    phone: '081311223344',
    dudiId: 'dudi-3',
    teacherId: 'usr-g1',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-g1',
    name: 'Drs. Bambang Hidayat, M.Pd.',
    email: 'bambang.guru@smkn1.sch.id',
    role: 'guru',
    nip: '197508122005011002',
    phone: '081122334455',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-g2',
    name: 'Eka Wijaya, S.T., M.T.',
    email: 'eka.guru@smkn1.sch.id',
    role: 'guru',
    nip: '198203152009022001',
    phone: '081255667788',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-d1',
    name: 'Ir. Hendra Gunawan (PT Telkom Indonesia)',
    email: 'hendra@telkom.co.id',
    role: 'dudi',
    dudiId: 'dudi-1',
    phone: '081299001122',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-adm1',
    name: 'Hj. Ratna Sari, S.Kom (Koordinator PKL)',
    email: 'ratna.admin@smkn1.sch.id',
    role: 'admin',
    nip: '198001012008012003',
    phone: '081388990011',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_DUDIS: Dudi[] = [
  {
    id: 'dudi-1',
    name: 'PT Telkom Indonesia Tbk',
    category: 'Teknologi Informasi & Jaringan',
    address: 'Jl. Jendral Gatot Subroto No. 52',
    city: 'Jakarta Selatan',
    contactPerson: 'Ir. Hendra Gunawan',
    phone: '021-5296000',
    email: 'hrd@telkom.co.id',
    quota: 5,
    assignedCount: 3,
    acceptedMajors: ['RPL', 'TKJ'],
    rating: 4.9,
    status: 'aktif'
  },
  {
    id: 'dudi-2',
    name: 'PT Astra International Tbk (Auto2000)',
    category: 'Otomotif & Manufaktur',
    address: 'Jl. Gaya Motor I No. 10, Sunter II',
    city: 'Jakarta Utara',
    contactPerson: 'Surya Permana, S.T.',
    phone: '021-6522555',
    email: 'pkl@auto2000.co.id',
    quota: 4,
    assignedCount: 4,
    acceptedMajors: ['TKRO', 'TBSM'],
    rating: 4.8,
    status: 'penuh'
  },
  {
    id: 'dudi-3',
    name: 'Studio Creative Digital (Bintang Multimedia)',
    category: 'Desain Komunikasi Visual & Media',
    address: 'Jl. Danau Toba No. 14',
    city: 'Jakarta Pusat',
    contactPerson: 'Maya Kartika, S.Ds',
    phone: '0812-3411-9988',
    email: 'career@bintangmultimedia.com',
    quota: 6,
    assignedCount: 2,
    acceptedMajors: ['DKV', 'Broadcasting'],
    rating: 4.7,
    status: 'aktif'
  },
  {
    id: 'dudi-4',
    name: 'PT Bank Central Asia Tbk (BCA Finance)',
    category: 'Perbankan & Akuntansi',
    address: 'Jl. MH Thamrin No. 1',
    city: 'Jakarta Pusat',
    contactPerson: 'Rina Soeprapto',
    phone: '021-2358800',
    email: 'internship@bcafinance.co.id',
    quota: 3,
    assignedCount: 1,
    acceptedMajors: ['AKL', 'OTKP'],
    rating: 4.9,
    status: 'aktif'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'usr-s-rahmawati',
    name: 'RAHMAWATI',
    nisn: '3098182025',
    classMajor: 'XII TKR',
    phone: '081299887711',
    teacherId: 'usr-g-nurcholis',
    teacherName: 'NURCHOLIS MAJID,S.Kom',
    statusPKL: 'belum_dapat',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-s-alif',
    name: 'ALIF KHAIRUL SABILILLAH',
    nisn: '0088888728',
    classMajor: 'XII RPL 1',
    phone: '081288776655',
    statusPKL: 'sedang_pkl',
    startDate: '2026-07-14',
    endDate: '2026-10-16',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-s-wahyu',
    name: 'WAHYU RAMADHAN',
    nisn: '0084394725',
    classMajor: 'XII TKJ 1',
    phone: '081377665544',
    statusPKL: 'sedang_pkl',
    startDate: '2026-07-14',
    endDate: '2026-10-16',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-s-andrey',
    name: 'MUHAMAD ANDREYANSYAH',
    nisn: '3093916315',
    classMajor: 'XII TKR 2',
    phone: '081266554433',
    dudiId: 'dudi-ata',
    dudiName: 'Bengkel ATA Motor (Gintung-Sukadiri)',
    statusPKL: 'sedang_pkl',
    startDate: '2026-07-14',
    endDate: '2026-10-16',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-s1',
    name: 'Ahmad Rizky Pratama',
    nisn: '0054321098',
    classMajor: 'XII RPL 1',
    phone: '081234567890',
    dudiId: 'dudi-1',
    dudiName: 'PT Telkom Indonesia Tbk',
    teacherId: 'usr-g1',
    teacherName: 'Drs. Bambang Hidayat, M.Pd.',
    industrySupervisorName: 'Ir. Hendra Gunawan',
    statusPKL: 'sedang_pkl',
    startDate: '2026-07-01',
    endDate: '2026-10-01',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-s2',
    name: 'Siti Nurhaliza',
    nisn: '0054321099',
    classMajor: 'XII TKJ 2',
    phone: '081298765432',
    dudiId: 'dudi-2',
    dudiName: 'PT Astra International Tbk (Auto2000)',
    teacherId: 'usr-g2',
    teacherName: 'Eka Wijaya, S.T., M.T.',
    industrySupervisorName: 'Surya Permana, S.T.',
    statusPKL: 'sedang_pkl',
    startDate: '2026-07-01',
    endDate: '2026-10-01',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-s3',
    name: 'Budi Santoso',
    nisn: '0054321100',
    classMajor: 'XII DKV 1',
    phone: '081311223344',
    dudiId: 'dudi-3',
    dudiName: 'Studio Creative Digital (Bintang Multimedia)',
    teacherId: 'usr-g1',
    teacherName: 'Drs. Bambang Hidayat, M.Pd.',
    industrySupervisorName: 'Maya Kartika, S.Ds',
    statusPKL: 'sedang_pkl',
    startDate: '2026-07-01',
    endDate: '2026-10-01',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-s4',
    name: 'Dewi Anggraini',
    nisn: '0054321101',
    classMajor: 'XII AKL 2',
    phone: '081244556677',
    dudiId: 'dudi-4',
    dudiName: 'PT Bank Central Asia Tbk (BCA Finance)',
    teacherId: 'usr-g2',
    teacherName: 'Eka Wijaya, S.T., M.T.',
    industrySupervisorName: 'Rina Soeprapto',
    statusPKL: 'sedang_pkl',
    startDate: '2026-07-01',
    endDate: '2026-10-01',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-s5',
    name: 'Fikri Ardiansyah',
    nisn: '0054321102',
    classMajor: 'XII RPL 2',
    phone: '081399887766',
    statusPKL: 'mengajukan',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'usr-g1',
    name: 'Drs. Bambang Hidayat, M.Pd.',
    nip: '197508122005011002',
    phone: '081122334455',
    email: 'bambang.guru@smkn1.sch.id',
    assignedStudentCount: 2
  },
  {
    id: 'usr-g2',
    name: 'Eka Wijaya, S.T., M.T.',
    nip: '198203152009022001',
    phone: '081255667788',
    email: 'eka.guru@smkn1.sch.id',
    assignedStudentCount: 2
  }
];

export const INITIAL_ATTENDANCES: AttendanceRecord[] = [
  {
    id: 'att-1',
    studentId: 'usr-s1',
    studentName: 'Ahmad Rizky Pratama',
    date: '2026-07-28',
    timeIn: '07:45',
    timeOut: '17:00',
    status: 'hadir',
    notes: 'Bekerja tepat waktu di lab software Telkom',
    locationAddress: 'PT Telkom Indonesia, Gatot Subroto, Jakarta',
    latitude: -6.2297,
    longitude: 106.8173,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    validatedByDudi: true
  },
  {
    id: 'att-2',
    studentId: 'usr-s2',
    studentName: 'Siti Nurhaliza',
    date: '2026-07-28',
    timeIn: '07:55',
    timeOut: '16:30',
    status: 'hadir',
    notes: 'Pemeriksaan unit servis berkala',
    locationAddress: 'Auto2000 Sunter, Jakarta Utara',
    latitude: -6.1384,
    longitude: 106.8793,
    validatedByDudi: true
  },
  {
    id: 'att-3',
    studentId: 'usr-s1',
    studentName: 'Ahmad Rizky Pratama',
    date: '2026-07-27',
    timeIn: '07:50',
    timeOut: '17:15',
    status: 'hadir',
    notes: 'Testing API backend Express & Node.js',
    locationAddress: 'PT Telkom Indonesia, Jakarta',
    latitude: -6.2297,
    longitude: 106.8173,
    validatedByDudi: true
  }
];

export const INITIAL_JOURNALS: DailyJournal[] = [
  {
    id: 'jrn-1',
    studentId: 'usr-s1',
    studentName: 'Ahmad Rizky Pratama',
    date: '2026-07-28',
    activityTitle: 'Mengembangkan Endpoint REST API untuk Sistem SIM PKL',
    description: 'Membuat controller dan route Express.js untuk autentikasi dan integrasi database Supabase. Melakukan unit testing endpoint menguji respons data JSON.',
    learnings: 'Memahami arsitektur middleware Express.js, penanganan async-await, dan pengamanan kredensial database.',
    status: 'disetujui',
    teacherFeedback: 'Bagus sekali Rizky. Lanjutkan dengan dokumentasi API Swagger/Postman.',
    dudiFeedback: 'Sangat mandiri dan kodingannya rapi.',
    aiPolished: true
  },
  {
    id: 'jrn-2',
    studentId: 'usr-s1',
    studentName: 'Ahmad Rizky Pratama',
    date: '2026-07-27',
    activityTitle: 'Slicing UI Responsive Dashboard Menggunakan Tailwind CSS',
    description: 'Mengimplementasikan komponen visual dashboard untuk siswa dan pembimbing. Memastikan tata letak responsif pada tampilan perangkat seluler dan desktop.',
    learnings: 'Memahami utility class Tailwind v4, Flexbox layout, dan CSS Grid untuk tampilan kompleks.',
    status: 'disetujui',
    teacherFeedback: 'Sesuai dengan standar industri.',
    dudiFeedback: 'Hasil UI sangat modern dan mudah dipahami pengguna.',
    aiPolished: true
  },
  {
    id: 'jrn-3',
    studentId: 'usr-s2',
    studentName: 'Siti Nurhaliza',
    date: '2026-07-28',
    activityTitle: 'Konfigurasi Router & Mikrotik Bandwidth Management',
    description: 'Melakukan setup queue tree dan hotspot gateway di jaringan divisi internal kantor cabang.',
    learnings: 'Memahami manajemen bandwidth, VLAN tagging, dan troublingshooting koneksi gateway.',
    status: 'menunggu',
    aiPolished: false
  }
];

export const INITIAL_SUPERVISIONS: SupervisionLog[] = [
  {
    id: 'sup-1',
    teacherId: 'usr-g1',
    teacherName: 'Drs. Bambang Hidayat, M.Pd.',
    dudiId: 'dudi-1',
    dudiName: 'PT Telkom Indonesia Tbk',
    date: '2026-07-20',
    notes: 'Kunjungan monitoring pertama. Diskusi dengan Pak Hendra (Pembimbing DUDI). Siswa Ahmad Rizky menunjukkan progres koding sangat baik.',
    studentsPresent: ['usr-s1']
  }
];

export const INITIAL_GRADES: EvaluationGrade[] = [
  {
    id: 'grd-1',
    studentId: 'usr-s1',
    studentName: 'Ahmad Rizky Pratama',
    dudiId: 'dudi-1',
    jurnalScore: 92,
    laporanScore: 90,
    presentasiScore: 95,
    disiplinScore: 94,
    kerjasamaScore: 92,
    inisiatifScore: 96,
    teknisScore: 95,
    finalScore: 93.8,
    gradeLetter: 'A',
    certificateNumber: 'SK/PKL/2026/08812',
    isPublished: true
  },
  {
    id: 'grd-2',
    studentId: 'usr-s2',
    studentName: 'Siti Nurhaliza',
    dudiId: 'dudi-2',
    jurnalScore: 88,
    laporanScore: 86,
    presentasiScore: 90,
    disiplinScore: 92,
    kerjasamaScore: 90,
    inisiatifScore: 88,
    teknisScore: 89,
    finalScore: 89.2,
    gradeLetter: 'A',
    certificateNumber: 'SK/PKL/2026/08813',
    isPublished: true
  }
];

export const INITIAL_LETTERS: ApplicationLetter[] = [
  {
    id: 'ltr-1',
    letterNumber: '421.5/089/SMKN1/2026',
    studentIds: ['usr-s1'],
    dudiId: 'dudi-1',
    dudiName: 'PT Telkom Indonesia Tbk',
    createdAt: '2026-06-10',
    status: 'diterima',
    content: 'Surat Permohonan Tempat Praktik Kerja Lapangan (PKL) Periode Juli - Oktober 2026.'
  }
];

export const INITIAL_CLASSES: ClassMajorItem[] = [
  { id: 'cls-1', className: 'XII TKR', majorName: 'Teknik Kendaraan Ringan' },
  { id: 'cls-2', className: 'XII DKV', majorName: 'Desain Komunikasi Visual' },
  { id: 'cls-3', className: 'XII RPL 1', majorName: 'Rekayasa Perangkat Lunak' },
  { id: 'cls-4', className: 'XII TKJ 1', majorName: 'Teknik Komputer & Jaringan' }
];

