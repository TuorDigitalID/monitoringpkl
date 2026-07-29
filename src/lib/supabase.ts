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
  dudi_id TEXT REFERENCES dudis(id),
  dudi_name TEXT,
  teacher_id TEXT REFERENCES teachers(id),
  teacher_name TEXT,
  industry_supervisor_name TEXT,
  status_pkl TEXT DEFAULT 'belum_dapat',
  start_date DATE,
  end_date DATE,
  photo_url TEXT
);

-- MIGRASI KOLOM (Memastikan tabel lama jika sudah ada tetap memiliki kolom terbaru):
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

-- 4. TABEL JURNAL HARIAN
CREATE TABLE IF NOT EXISTS daily_journals (
  id TEXT PRIMARY KEY,
  student_id TEXT REFERENCES students(id),
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
  student_id TEXT REFERENCES students(id),
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

-- 6. TABEL PENILAIAN EVALUASI PKL
CREATE TABLE IF NOT EXISTS evaluation_grades (
  id TEXT PRIMARY KEY,
  student_id TEXT REFERENCES students(id),
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

-- ===================================================
-- SAMPLE SEED DATA (DML)
-- ===================================================

-- Sample Users Multi-Role Login (Admin, Guru, Siswa)
INSERT INTO users (id, name, email, role, nisn, nip, phone, class_major, password) VALUES
  ('usr-admin-1', 'SUPER ADMIN KOORDINATOR', 'admin@simpkl.com', 'admin', NULL, '198501012010011001', '08123456789', NULL, 'admin123'),
  ('usr-g-1', 'DWI FANNI SUPRIYANTI, S.Pd.', '2026006@guru.simpkl.com', 'guru', NULL, '2026006', '-', NULL, 'guru@123'),
  ('std-1', 'RAHMAWATI', '3098182025@siswa.simpkl.com', 'siswa', '3098182025', NULL, '-', 'XII TKR', 'password123')
ON CONFLICT (id) DO NOTHING;

-- Sample Master Kelas
INSERT INTO classes (id, class_name, major_name) VALUES
  ('cls-1', 'XII TKR', 'Teknik Kendaraan Ringan'),
  ('cls-2', 'XII DKV', 'Desain Komunikasi Visual'),
  ('cls-3', 'XII RPL 1', 'Rekayasa Perangkat Lunak'),
  ('cls-4', 'XII TKJ 1', 'Teknik Komputer & Jaringan')
ON CONFLICT (id) DO NOTHING;

-- Sample Master Instansi
INSERT INTO dudis (id, name, address, quota, contact_person, phone) VALUES
  ('dudi-1', 'PT. Flexofast', 'Jl. Pembangunan No.9, RT.01/RW.02', 2, 'Budi Santoso', '085212345678'),
  ('dudi-2', 'Bengkel Pancuran Mas', 'Jl. Bio Banten Kampung Sindang', 1, 'Ahmad Dahlan', '081298765432'),
  ('dudi-3', 'Konfeksi Gintung Tugu', 'Gintung Tugu', 3, 'Siti Hajar', '081311223344')
ON CONFLICT (id) DO NOTHING;

-- Sample Master Guru Pembimbing
INSERT INTO teachers (id, name, nip, email, phone, password) VALUES
  ('usr-g-1', 'DWI FANNI SUPRIYANTI, S.Pd.', '2026006', '2026006@guru.simpkl.com', '-', 'guru@123'),
  ('usr-g-2', 'NURCHOLIS MAJID, S.Kom', '2026001', 'nurcholis@guru.simpkl.com', '081234567890', 'guru@123'),
  ('usr-g-3', 'IFTAH NURJANAH, S.Pd', '2026002', 'iftah@guru.simpkl.com', '081298765432', 'guru@123')
ON CONFLICT (id) DO NOTHING;

-- Sample Master Siswa (Lengkap dengan Plotting DUDI & Guru)
INSERT INTO students (id, name, nisn, class_major, password, phone, dudi_id, dudi_name, teacher_id, teacher_name, start_date, end_date, status_pkl) VALUES
  ('std-1', 'RAHMAWATI', '0071234567', 'XII TKR', 'password123', '-', 'dudi-1', 'PT. Flexofast', 'usr-g-1', 'DWI FANNI SUPRIYANTI, S.Pd.', '2026-07-16', '2026-10-16', 'sedang_pkl'),
  ('std-2', 'BUDI SANTOSO', '0088888728', 'XII RPL 1', 'password123', '-', 'dudi-2', 'Bengkel Pancuran Mas', 'usr-g-2', 'NURCHOLIS MAJID, S.Kom', '2026-07-16', '2026-10-16', 'sedang_pkl'),
  ('std-3', 'CITRA DEWI', '0084394725', 'XII TKJ 1', 'password123', '-', NULL, NULL, 'usr-g-3', 'IFTAH NURJANAH, S.Pd', NULL, NULL, 'belum_dapat')
ON CONFLICT (id) DO NOTHING;
`;
