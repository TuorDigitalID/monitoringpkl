/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const LOCAL_STORAGE_SUPABASE_KEY = 'sim_pkl_supabase_config';

export function getStoredSupabaseConfig() {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_SUPABASE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse saved Supabase config:', e);
  }

  return {
    url: envUrl,
    anonKey: envKey,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  localStorage.setItem(LOCAL_STORAGE_SUPABASE_KEY, JSON.stringify({ url, anonKey }));
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey);
    } catch (err) {
      console.error('Error initializing Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
}

export function resetSupabaseClient() {
  supabaseInstance = null;
}

export const SUPABASE_SQL_SCHEMA_SCRIPT = `-- ===================================================
-- SQL SCHEMA DDL & INITIAL SEED DML FOR SIM PKL SMK/MA
-- (Dapat dijalankan langsung di Supabase SQL Editor, PostgreSQL)
-- ===================================================

-- 1. TABEL PENGGUNA & AKUN LOGIN (USERS)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'siswa', -- 'siswa', 'guru', 'admin', 'dudi'
  nisn TEXT,
  nip TEXT,
  phone TEXT DEFAULT '-',
  class_major TEXT,
  password TEXT DEFAULT 'password123',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABEL MASTER KELAS & JURUSAN
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  class_name TEXT NOT NULL,
  major_name TEXT NOT NULL
);

-- 3. TABEL MITRA INSTANSI / PERUSAHAAN (DUDI)
CREATE TABLE IF NOT EXISTS dudis (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Teknik & Industri',
  address TEXT,
  city TEXT DEFAULT 'Tangerang',
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  quota INT DEFAULT 5,
  assigned_count INT DEFAULT 0,
  accepted_majors TEXT[],
  rating NUMERIC DEFAULT 5.0,
  status TEXT DEFAULT 'aktif'
);

-- 4. TABEL GURU PEMBIMBING
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nip TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  phone TEXT DEFAULT '-',
  assigned_student_count INT DEFAULT 0,
  password TEXT DEFAULT 'guru@123'
);

-- 5. TABEL DATA SISWA MAGANG / PKL
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nisn TEXT UNIQUE NOT NULL,
  class_major TEXT NOT NULL,
  jurusan TEXT,
  password TEXT DEFAULT 'password123',
  phone TEXT DEFAULT '-',
  dudi_id TEXT,
  dudi_name TEXT,
  teacher_id TEXT,
  teacher_name TEXT,
  industry_supervisor_name TEXT,
  status_pkl TEXT DEFAULT 'belum_dapat',
  start_date DATE,
  end_date DATE,
  photo_url TEXT
);

-- 6. TABEL JURNAL HARIAN
CREATE TABLE IF NOT EXISTS daily_journals (
  id TEXT PRIMARY KEY,
  student_id TEXT,
  student_name TEXT,
  date DATE NOT NULL,
  activity_title TEXT NOT NULL,
  description TEXT,
  learnings TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'menunggu',
  teacher_feedback TEXT,
  dudi_feedback TEXT,
  ai_polished BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABEL PRESENSI / ABSENSI
CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  student_id TEXT,
  student_name TEXT,
  date DATE NOT NULL,
  time_in TEXT,
  time_out TEXT,
  status TEXT DEFAULT 'hadir',
  notes TEXT,
  location_address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  photo_url TEXT,
  validated_by_dudi BOOLEAN DEFAULT false
);

-- 8. TABEL PENILAIAN EVALUASI PKL
CREATE TABLE IF NOT EXISTS evaluation_grades (
  id TEXT PRIMARY KEY,
  student_id TEXT,
  student_name TEXT,
  dudi_id TEXT,
  jurnal_score NUMERIC DEFAULT 0,
  laporan_score NUMERIC DEFAULT 0,
  presentasi_score NUMERIC DEFAULT 0,
  disiplin_score NUMERIC DEFAULT 0,
  kerjasama_score NUMERIC DEFAULT 0,
  inisiatif_score NUMERIC DEFAULT 0,
  teknis_score NUMERIC DEFAULT 0,
  final_score NUMERIC DEFAULT 0,
  grade_letter TEXT,
  certificate_number TEXT,
  is_published BOOLEAN DEFAULT false
);

-- MIGRASI KOLOM UNTUK TABEL YANG SUDAH ADA SEBELUMNYA
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'guru@123';
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '-';
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS assigned_student_count INT DEFAULT 0;

ALTER TABLE students ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'password123';
ALTER TABLE students ADD COLUMN IF NOT EXISTS class_major TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS jurusan TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '-';
ALTER TABLE students ADD COLUMN IF NOT EXISTS dudi_id TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS dudi_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS teacher_id TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS teacher_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS industry_supervisor_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS status_pkl TEXT DEFAULT 'belum_dapat';
ALTER TABLE students ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS photo_url TEXT;

ALTER TABLE daily_journals ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE daily_journals ADD COLUMN IF NOT EXISTS learnings TEXT;
ALTER TABLE daily_journals ADD COLUMN IF NOT EXISTS teacher_feedback TEXT;

-- DUKUNGAN KONEKSI LIVE REAL-TIME (DISABLE ROW LEVEL SECURITY AGAR ANON KEY BEBAS AKSEST)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE dudis DISABLE ROW LEVEL SECURITY;
ALTER TABLE teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_journals DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_grades DISABLE ROW LEVEL SECURITY;
`;

export async function syncUpsertUser(user: any) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const { error } = await client.from('users').upsert({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      nisn: user.nisn || null,
      nip: user.nip || null,
      phone: user.phone || '-',
      class_major: user.classMajor || null,
      password: user.password || 'password123'
    });
    if (error) console.error('Supabase sync user error:', error);
  } catch (err) {
    console.warn('Supabase sync user failed:', err);
  }
}

export async function syncDeleteUser(id: string) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const { error } = await client.from('users').delete().eq('id', id);
    if (error) console.error('Supabase delete user error:', error);
  } catch (err) {
    console.warn('Supabase delete user failed:', err);
  }
}

export async function syncUpsertDudi(dudi: any) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const { error } = await client.from('dudis').upsert({
      id: dudi.id,
      name: dudi.name,
      category: dudi.category || 'Teknik & Industri',
      address: dudi.address || '',
      city: dudi.city || 'Tangerang',
      contact_person: dudi.contactPerson || '',
      phone: dudi.phone || '',
      email: dudi.email || '',
      quota: dudi.quota || 5,
      assigned_count: dudi.assignedCount || 0,
      accepted_majors: dudi.acceptedMajors || [],
      rating: dudi.rating || 5.0,
      status: dudi.status || 'aktif'
    });
    if (error) console.error('Supabase sync dudi error:', error);
  } catch (err) {
    console.warn('Supabase sync dudi failed:', err);
  }
}

export async function syncDeleteDudi(id: string) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const { error } = await client.from('dudis').delete().eq('id', id);
    if (error) console.error('Supabase delete dudi error:', error);
  } catch (err) {
    console.warn('Supabase delete dudi failed:', err);
  }
}

export async function syncUpsertTeacher(teacher: any) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const { error } = await client.from('teachers').upsert({
      id: teacher.id,
      name: teacher.name,
      nip: teacher.nip,
      email: teacher.email || `${teacher.nip}@guru.simpkl.com`,
      phone: teacher.phone || '-',
      assigned_student_count: teacher.assignedStudentCount || 0,
      password: teacher.password || 'guru@123'
    });
    if (error) console.error('Supabase sync teacher error:', error);
  } catch (err) {
    console.warn('Supabase sync teacher failed:', err);
  }
}

export async function syncDeleteTeacher(id: string) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const { error } = await client.from('teachers').delete().eq('id', id);
    if (error) console.error('Supabase delete teacher error:', error);
  } catch (err) {
    console.warn('Supabase delete teacher failed:', err);
  }
}

export async function syncUpsertStudent(student: any) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const { error } = await client.from('students').upsert({
      id: student.id,
      name: student.name,
      nisn: student.nisn,
      class_major: student.classMajor,
      phone: student.phone || '-',
      dudi_id: student.dudiId || null,
      dudi_name: student.dudiName || null,
      teacher_id: student.teacherId || null,
      teacher_name: student.teacherName || null,
      industry_supervisor_name: student.industrySupervisorName || null,
      status_pkl: student.statusPKL || 'belum_dapat',
      start_date: student.startDate || null,
      end_date: student.endDate || null,
      photo_url: student.photoUrl || null
    });
    if (error) console.error('Supabase sync student error:', error);
  } catch (err) {
    console.warn('Supabase sync student failed:', err);
  }
}

export async function syncDeleteStudent(id: string) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const { error } = await client.from('students').delete().eq('id', id);
    if (error) console.error('Supabase delete student error:', error);
  } catch (err) {
    console.warn('Supabase delete student failed:', err);
  }
}

export async function syncUpsertClass(cls: any) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const { error } = await client.from('classes').upsert({
      id: cls.id,
      class_name: cls.className,
      major_name: cls.majorName
    });
    if (error) console.error('Supabase sync class error:', error);
  } catch (err) {
    console.warn('Supabase sync class failed:', err);
  }
}

export async function syncDeleteClass(id: string) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const { error } = await client.from('classes').delete().eq('id', id);
    if (error) console.error('Supabase delete class error:', error);
  } catch (err) {
    console.warn('Supabase delete class failed:', err);
  }
}

export async function syncUpsertJournal(journal: any) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const { error } = await client.from('daily_journals').upsert({
      id: journal.id,
      student_id: journal.studentId,
      student_name: journal.studentName,
      date: journal.date,
      activity_title: journal.activityTitle,
      description: journal.description || journal.activityTitle,
      learnings: journal.learnings || journal.description || '',
      photo_url: journal.photoUrl || null,
      status: journal.status || 'menunggu',
      teacher_feedback: journal.teacherFeedback || null
    });
    if (error) console.error('Supabase sync journal error:', error);
  } catch (err) {
    console.warn('Supabase sync journal failed:', err);
  }
}

export async function syncUpsertAttendance(att: any) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const { error } = await client.from('attendance_records').upsert({
      id: att.id,
      student_id: att.studentId,
      student_name: att.studentName,
      date: att.date,
      time_in: att.timeIn,
      time_out: att.timeOut || null,
      status: att.status,
      notes: att.notes || null,
      validated_by_dudi: att.validatedByDudi ?? false,
      photo_url: att.photoUrl || null,
      latitude: att.latitude || null,
      longitude: att.longitude || null
    });
    if (error) console.error('Supabase sync attendance error:', error);
  } catch (err) {
    console.warn('Supabase sync attendance failed:', err);
  }
}

export async function syncUpsertGrade(grade: any) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const { error } = await client.from('evaluation_grades').upsert({
      id: grade.id,
      student_id: grade.studentId,
      student_name: grade.studentName,
      dudi_id: grade.dudiId,
      jurnal_score: grade.jurnalScore || 0,
      laporan_score: grade.laporanScore || 0,
      presentasi_score: grade.presentasiScore || 0,
      disiplin_score: grade.disiplinScore || 0,
      kerjasama_score: grade.kerjasamaScore || 0,
      inisiatif_score: grade.inisiatifScore || 0,
      teknis_score: grade.teknisScore || 0,
      final_score: grade.finalScore || 0,
      grade_letter: grade.gradeLetter || 'B',
      certificate_number: grade.certificateNumber || null,
      is_published: grade.isPublished ?? false
    });
    if (error) console.error('Supabase sync grade error:', error);
  } catch (err) {
    console.warn('Supabase sync grade failed:', err);
  }
}

export async function pushAllDataToSupabase(storeData: {
  users?: any[];
  dudis?: any[];
  teachers?: any[];
  students?: any[];
  classes?: any[];
  journals?: any[];
  attendances?: any[];
  grades?: any[];
}) {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase client belum dikonfigurasi. Masukkan Supabase Project URL dan Anon Key!',
      count: 0
    };
  }

  let syncedCount = 0;
  const errors: string[] = [];

  try {
    // 1. Classes
    if (storeData.classes && storeData.classes.length > 0) {
      const payload = storeData.classes.map((c) => ({
        id: c.id,
        class_name: c.className || 'XII',
        major_name: c.majorName || '-'
      }));
      const { error } = await client.from('classes').upsert(payload);
      if (error) errors.push(`Kelas (${error.message})`);
      else syncedCount += payload.length;
    }

    // 2. Users
    if (storeData.users && storeData.users.length > 0) {
      const payload = storeData.users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email || `${u.id}@simpkl.com`,
        role: u.role || 'siswa',
        nisn: u.nisn || null,
        nip: u.nip || null,
        phone: u.phone || '-',
        class_major: u.classMajor || null,
        password: u.password || 'password123'
      }));
      const { error } = await client.from('users').upsert(payload);
      if (error) errors.push(`Pengguna (${error.message})`);
      else syncedCount += payload.length;
    }

    // 3. DUDIs
    if (storeData.dudis && storeData.dudis.length > 0) {
      const payload = storeData.dudis.map((d) => ({
        id: d.id,
        name: d.name,
        category: d.category || 'Teknik & Industri',
        address: d.address || '',
        city: d.city || 'Tangerang',
        contact_person: d.contactPerson || d.contact_person || '',
        phone: d.phone || '-',
        email: d.email || '',
        quota: Number(d.quota || 5),
        assigned_count: Number(d.assignedCount || 0),
        accepted_majors: d.acceptedMajors || [],
        rating: Number(d.rating || 5.0),
        status: d.status || 'aktif'
      }));
      const { error } = await client.from('dudis').upsert(payload);
      if (error) errors.push(`Instansi (${error.message})`);
      else syncedCount += payload.length;
    }

    // 4. Teachers
    if (storeData.teachers && storeData.teachers.length > 0) {
      const payload = storeData.teachers.map((t) => ({
        id: t.id,
        name: t.name,
        nip: t.nip || t.id,
        phone: t.phone || '-',
        email: t.email || `${t.nip || t.id}@guru.simpkl.com`,
        assigned_student_count: Number(t.assignedStudentCount || 0),
        password: t.password || 'guru@123'
      }));
      const { error } = await client.from('teachers').upsert(payload);
      if (error) errors.push(`Guru (${error.message})`);
      else syncedCount += payload.length;
    }

    // 5. Students
    if (storeData.students && storeData.students.length > 0) {
      const payload = storeData.students.map((s) => ({
        id: s.id,
        name: s.name,
        nisn: s.nisn || s.id,
        class_major: s.classMajor || 'XII',
        jurusan: s.jurusan || s.classMajor || '-',
        phone: s.phone || '-',
        dudi_id: s.dudiId || null,
        dudi_name: s.dudiName || null,
        teacher_id: s.teacherId || null,
        teacher_name: s.teacherName || null,
        industry_supervisor_name: s.industrySupervisorName || null,
        status_pkl: s.statusPKL || 'belum_dapat',
        start_date: s.startDate || null,
        end_date: s.endDate || null,
        photo_url: s.photoUrl || null
      }));
      const { error } = await client.from('students').upsert(payload);
      if (error) errors.push(`Siswa (${error.message})`);
      else syncedCount += payload.length;
    }

    // 6. Daily Journals
    if (storeData.journals && storeData.journals.length > 0) {
      const payload = storeData.journals.map((j) => ({
        id: j.id,
        student_id: j.studentId,
        student_name: j.studentName,
        date: j.date,
        activity_title: j.activityTitle,
        description: j.description || j.activityTitle,
        learnings: j.learnings || j.description || '',
        photo_url: j.photoUrl || null,
        status: j.status || 'menunggu',
        teacher_feedback: j.teacherFeedback || null
      }));
      const { error } = await client.from('daily_journals').upsert(payload);
      if (error) errors.push(`Jurnal (${error.message})`);
      else syncedCount += payload.length;
    }

    // 7. Attendance Records
    if (storeData.attendances && storeData.attendances.length > 0) {
      const payload = storeData.attendances.map((a) => ({
        id: a.id,
        student_id: a.studentId,
        student_name: a.studentName,
        date: a.date,
        time_in: a.timeIn,
        time_out: a.timeOut || null,
        status: a.status,
        notes: a.notes || null,
        validated_by_dudi: a.validatedByDudi ?? false,
        photo_url: a.photoUrl || null,
        latitude: a.latitude || null,
        longitude: a.longitude || null
      }));
      const { error } = await client.from('attendance_records').upsert(payload);
      if (error) errors.push(`Presensi (${error.message})`);
      else syncedCount += payload.length;
    }

    // 8. Evaluation Grades
    if (storeData.grades && storeData.grades.length > 0) {
      const payload = storeData.grades.map((g) => ({
        id: g.id,
        student_id: g.studentId,
        student_name: g.studentName,
        dudi_id: g.dudiId,
        jurnal_score: Number(g.jurnalScore || 0),
        laporan_score: Number(g.laporanScore || 0),
        presentasi_score: Number(g.presentasiScore || 0),
        disiplin_score: Number(g.disiplinScore || 0),
        kerjasama_score: Number(g.kerjasamaScore || 0),
        inisiatif_score: Number(g.inisiatifScore || 0),
        teknis_score: Number(g.teknisScore || 0),
        final_score: Number(g.finalScore || 0),
        grade_letter: g.gradeLetter || 'B',
        certificate_number: g.certificateNumber || null,
        is_published: g.isPublished ?? false
      }));
      const { error } = await client.from('evaluation_grades').upsert(payload);
      if (error) errors.push(`Nilai (${error.message})`);
      else syncedCount += payload.length;
    }

    if (errors.length > 0) {
      return {
        success: false,
        message: `Sinkronisasi parsial (${syncedCount} item berhasil). Kendala: ${errors.join(', ')}`,
        count: syncedCount
      };
    }

    return {
      success: true,
      message: `Sukses! Sebanyak ${syncedCount} record data berhasil diunggah ke Supabase Cloud!`,
      count: syncedCount
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal tersambung ke Supabase Cloud: ${err?.message || String(err)}`,
      count: syncedCount
    };
  }
}

export async function fetchAllDataFromSupabase() {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const [
      { data: users, error: errUsers },
      { data: dudis, error: errDudis },
      { data: teachers, error: errTeachers },
      { data: students, error: errStudents },
      { data: classes, error: errClasses },
      { data: journals, error: errJournals },
      { data: attendances, error: errAttendances },
      { data: grades, error: errGrades }
    ] = await Promise.all([
      client.from('users').select('*'),
      client.from('dudis').select('*'),
      client.from('teachers').select('*'),
      client.from('students').select('*'),
      client.from('classes').select('*'),
      client.from('daily_journals').select('*'),
      client.from('attendance_records').select('*'),
      client.from('evaluation_grades').select('*')
    ]);

    if (errUsers || errDudis || errTeachers || errStudents) {
      console.warn('Supabase fetch returned error:', { errUsers, errDudis, errTeachers, errStudents });
    }

    return {
      users: users ? users.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        nisn: u.nisn,
        nip: u.nip,
        phone: u.phone,
        classMajor: u.class_major,
        password: u.password
      })) : null,
      dudis: dudis ? dudis.map((d: any) => ({
        id: d.id,
        name: d.name,
        category: d.category,
        address: d.address,
        city: d.city,
        contactPerson: d.contact_person,
        phone: d.phone,
        email: d.email,
        quota: d.quota,
        assignedCount: d.assigned_count,
        acceptedMajors: d.accepted_majors || [],
        rating: Number(d.rating || 5),
        status: d.status
      })) : null,
      teachers: teachers ? teachers.map((t: any) => ({
        id: t.id,
        name: t.name,
        nip: t.nip,
        email: t.email,
        phone: t.phone,
        assignedStudentCount: t.assigned_student_count || 0,
        password: t.password
      })) : null,
      students: students ? students.map((s: any) => ({
        id: s.id,
        name: s.name,
        nisn: s.nisn,
        classMajor: s.class_major,
        phone: s.phone,
        dudiId: s.dudi_id,
        dudiName: s.dudi_name,
        teacherId: s.teacher_id,
        teacherName: s.teacher_name,
        industrySupervisorName: s.industry_supervisor_name,
        statusPKL: s.status_pkl || 'belum_dapat',
        startDate: s.start_date,
        endDate: s.end_date,
        photoUrl: s.photo_url
      })) : null,
      classes: classes ? classes.map((c: any) => ({
        id: c.id,
        className: c.class_name,
        majorName: c.major_name
      })) : null,
      journals: journals ? journals.map((j: any) => ({
        id: j.id,
        studentId: j.student_id,
        studentName: j.student_name,
        date: j.date,
        activityTitle: j.activity_title,
        description: j.description || j.activity_details || '',
        learnings: j.learnings || j.description || '',
        photoUrl: j.photo_url,
        status: j.status,
        teacherFeedback: j.teacher_feedback || j.teacher_notes
      })) : null,
      attendances: attendances ? attendances.map((a: any) => ({
        id: a.id,
        studentId: a.student_id,
        studentName: a.student_name,
        date: a.date,
        timeIn: a.time_in,
        timeOut: a.time_out,
        status: a.status,
        notes: a.notes,
        validatedByDudi: a.validated_by_dudi,
        photoUrl: a.photo_url,
        latitude: Number(a.latitude),
        longitude: Number(a.longitude)
      })) : null,
      grades: grades ? grades.map((g: any) => ({
        id: g.id,
        studentId: g.student_id,
        studentName: g.student_name,
        dudiId: g.dudi_id,
        jurnalScore: Number(g.jurnal_score || 0),
        laporanScore: Number(g.laporan_score || 0),
        presentasiScore: Number(g.presentasi_score || 0),
        disiplinScore: Number(g.disiplin_score || 0),
        kerjasamaScore: Number(g.kerjasama_score || 0),
        inisiatifScore: Number(g.inisiatif_score || 0),
        teknisScore: Number(g.teknis_score || 0),
        finalScore: Number(g.final_score || 0),
        gradeLetter: g.grade_letter,
        certificateNumber: g.certificate_number,
        isPublished: g.is_published
      })) : null
    };
  } catch (err) {
    console.warn('Failed to fetch data from Supabase:', err);
    return null;
  }
}

