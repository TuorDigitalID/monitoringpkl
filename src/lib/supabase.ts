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
-- (Dapat dijalankan langsung di Supabase SQL Editor, PostgreSQL, atau MySQL)
-- ===================================================

-- 1. TABEL PENGGUNA & AKUN LOGIN (USERS)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'siswa', -- 'siswa', 'guru', 'admin'
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

-- 2. TABEL MITRA INSTANSI / PERUSAHAAN (DUDI)
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

-- 3. TABEL GURU PEMBIMBING
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nip TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  phone TEXT DEFAULT '-',
  assigned_student_count INT DEFAULT 0,
  password TEXT DEFAULT 'guru@123'
);

-- 4. TABEL DATA SISWA MAGANG / PKL
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nisn TEXT UNIQUE NOT NULL,
  class_major TEXT NOT NULL,
  jurusan TEXT,
  password TEXT DEFAULT 'password123',
  phone TEXT DEFAULT '-',
  dudi_id TEXT REFERENCES dudis(id) ON DELETE SET NULL,
  dudi_name TEXT,
  teacher_id TEXT REFERENCES teachers(id) ON DELETE SET NULL,
  teacher_name TEXT,
  industry_supervisor_name TEXT,
  status_pkl TEXT DEFAULT 'belum_dapat',
  start_date DATE,
  end_date DATE,
  photo_url TEXT
);

-- MIGRASI KOLOM & FOREIGN KEY CONSTRAINT FIX
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

-- PERBAIKAN FOREIGN KEY AGAR BISA HAPUS DUDI / GURU / SISWA TANPA ERROR CONSTRAINT
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_dudi_id_fkey;
ALTER TABLE students ADD CONSTRAINT students_dudi_id_fkey FOREIGN KEY (dudi_id) REFERENCES dudis(id) ON DELETE SET NULL;

ALTER TABLE students DROP CONSTRAINT IF EXISTS students_teacher_id_fkey;
ALTER TABLE students ADD CONSTRAINT students_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL;

-- 4. TABEL JURNAL HARIAN
CREATE TABLE IF NOT EXISTS daily_journals (
  id TEXT PRIMARY KEY,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
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

-- 5. TABEL PRESENSI / ABSENSI
CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
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
-- 6. TABEL PENILAIAN EVALUASI PKL
CREATE TABLE IF NOT EXISTS evaluation_grades (
  id TEXT PRIMARY KEY,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
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
`;

export async function syncUpsertUser(user: any) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('users').upsert({
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
  } catch (err) {
    console.warn('Supabase sync user failed:', err);
  }
}

export async function syncDeleteUser(id: string) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('users').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase delete user failed:', err);
  }
}

export async function syncUpsertDudi(dudi: any) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('dudis').upsert({
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
  } catch (err) {
    console.warn('Supabase sync dudi failed:', err);
  }
}

export async function syncDeleteDudi(id: string) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('dudis').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase delete dudi failed:', err);
  }
}

export async function syncUpsertTeacher(teacher: any) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('teachers').upsert({
      id: teacher.id,
      name: teacher.name,
      nip: teacher.nip,
      email: teacher.email || `${teacher.nip}@guru.simpkl.com`,
      phone: teacher.phone || '-',
      assigned_student_count: teacher.assignedStudentCount || 0,
      password: teacher.password || 'guru@123'
    });
  } catch (err) {
    console.warn('Supabase sync teacher failed:', err);
  }
}

export async function syncDeleteTeacher(id: string) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('teachers').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase delete teacher failed:', err);
  }
}

export async function syncUpsertStudent(student: any) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('students').upsert({
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
  } catch (err) {
    console.warn('Supabase sync student failed:', err);
  }
}

export async function syncDeleteStudent(id: string) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('students').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase delete student failed:', err);
  }
}

export async function syncUpsertClass(cls: any) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('classes').upsert({
      id: cls.id,
      class_name: cls.className,
      major_name: cls.majorName
    });
  } catch (err) {
    console.warn('Supabase sync class failed:', err);
  }
}

export async function syncDeleteClass(id: string) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('classes').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase delete class failed:', err);
  }
}

export async function syncUpsertJournal(journal: any) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('daily_journals').upsert({
      id: journal.id,
      student_id: journal.studentId,
      student_name: journal.studentName,
      date: journal.date,
      activity_title: journal.activityTitle,
      activity_details: journal.description || journal.activityTitle,
      hours_spent: 8,
      photo_url: journal.photoUrl || null,
      status: journal.status || 'menunggu',
      teacher_notes: journal.teacherFeedback || null
    });
  } catch (err) {
    console.warn('Supabase sync journal failed:', err);
  }
}

export async function syncUpsertAttendance(att: any) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('attendance_records').upsert({
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
  } catch (err) {
    console.warn('Supabase sync attendance failed:', err);
  }
}

export async function syncUpsertGrade(grade: any) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('evaluation_grades').upsert({
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
  } catch (err) {
    console.warn('Supabase sync grade failed:', err);
  }
}

export async function fetchAllDataFromSupabase() {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const [
      { data: users },
      { data: dudis },
      { data: teachers },
      { data: students },
      { data: classes },
      { data: journals },
      { data: attendances },
      { data: grades }
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
        description: j.activity_details,
        learnings: j.activity_details,
        photoUrl: j.photo_url,
        status: j.status,
        teacherFeedback: j.teacher_notes
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
